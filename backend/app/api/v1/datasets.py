import io
import uuid
import pandas as pd
from typing import Any
from datetime import datetime
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy import text
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_db
from app.api.deps import get_tenant_context, TenantContext
from app.models.datasource import DataSource, SemanticTable

router = APIRouter()

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    context: TenantContext = Depends(get_tenant_context)
) -> Any:
    # 1. Validate file extension
    filename = file.filename
    if not (filename.endswith(".csv") or filename.endswith(".xlsx") or filename.endswith(".xls")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a CSV or Excel file."
        )

    # 2. Read dataset content into Pandas DataFrame
    try:
        contents = await file.read()
        if filename.endswith(".csv"):
            df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        else:
            df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse file: {str(e)}"
        )

    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    # 3. Clean and normalize column names for SQL compatibility
    clean_cols = []
    col_mapping = {}
    column_defs = {}
    
    for col in df.columns:
        # Clean column names (alphanumeric and underscores, lowercase)
        clean = "".join([c if c.isalnum() else "_" for c in str(col)]).strip("_").lower()
        while "__" in clean:
            clean = clean.replace("__", "_")
        if not clean:
            clean = f"col_{len(clean_cols)}"
        
        # Avoid duplicate clean column names
        base_clean = clean
        counter = 1
        while clean in clean_cols:
            clean = f"{base_clean}_{counter}"
            counter += 1
            
        clean_cols.append(clean)
        col_mapping[col] = clean
        
        # Simple type mapping for SQL table definition
        dtype = df[col].dtype
        if pd.api.types.is_integer_dtype(dtype):
            sql_type = "INTEGER"
            col_desc = "Integer metric value"
        elif pd.api.types.is_float_dtype(dtype):
            sql_type = "NUMERIC(18, 4)"
            col_desc = "Numeric decimal metric value"
        elif pd.api.types.is_bool_dtype(dtype):
            sql_type = "BOOLEAN"
            col_desc = "Boolean indicator"
        elif pd.api.types.is_datetime64_any_dtype(dtype):
            sql_type = "TIMESTAMP"
            col_desc = "Timestamp value"
        else:
            sql_type = "VARCHAR(255)"
            col_desc = "Text categorical dimension"
            
        column_defs[clean] = {
            "original_name": str(col),
            "type": sql_type,
            "description": col_desc
        }

    # 4. Generate dynamic table name
    unique_id = uuid.uuid4().hex[:8]
    table_name = f"user_data_{unique_id}"
    
    # 5. Create table in the database under insightflow_system schema
    columns_sql = [f'"{col_name}" {info["type"]}' for col_name, info in column_defs.items()]
    create_table_sql = f'CREATE TABLE insightflow_system."{table_name}" ({", ".join(columns_sql)})'
    
    try:
        await db.execute(text(create_table_sql))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize database table schema: {str(e)}"
        )

    # 6. Insert data rows
    placeholders = ", ".join([f":{col}" for col in clean_cols])
    cols_str = ", ".join([f'"{col}"' for col in clean_cols])
    insert_sql = f'INSERT INTO insightflow_system."{table_name}" ({cols_str}) VALUES ({placeholders})'
    
    records = []
    for _, row in df.iterrows():
        record = {}
        for orig_col, clean_col in col_mapping.items():
            val = row[orig_col]
            # Convert NaNs to None for SQL null compatibility
            if pd.isna(val):
                val = None
            elif isinstance(val, (int, float)) and pd.api.types.is_integer_dtype(df[orig_col].dtype):
                val = int(val) if not pd.isna(val) else None
            record[clean_col] = val
        records.append(record)
        
    try:
        # Batch insert execution
        await db.execute(text(insert_sql), records)
        await db.commit()
    except Exception as e:
        await db.rollback()
        # Drop the incomplete table
        try:
            await db.execute(text(f'DROP TABLE insightflow_system."{table_name}"'))
            await db.commit()
        except:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to populate dataset records: {str(e)}"
        )

    # 7. Register dataset in operational tables metadata
    source_id = uuid.uuid4()
    data_source = DataSource(
        source_id=source_id,
        tenant_id=uuid.UUID(context.tenant_id),
        source_name=filename,
        connection_type="uploaded_file",
        encrypted_credentials=table_name,
        is_active=True,
        last_synced_at=datetime.utcnow()
    )
    db.add(data_source)
    
    semantic_table = SemanticTable(
        table_id=uuid.uuid4(),
        source_id=source_id,
        table_name=table_name,
        column_definitions=column_defs,
        business_description=f"Uploaded dataset table: {filename}. Columns match user file format."
    )
    db.add(semantic_table)
    
    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register dataset metadata: {str(e)}"
        )

    return {
        "message": "Dataset successfully uploaded and registered.",
        "source_id": str(source_id),
        "table_name": table_name,
        "row_count": len(df),
        "columns": clean_cols
    }
