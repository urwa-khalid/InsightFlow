from typing import Any, Dict, Optional

class InsightFlowException(Exception):
    def __init__(
        self,
        status_code: int,
        error_code: str,
        message: str,
        details: Optional[Any] = None
    ):
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.details = details
        super().__init__(self.message)

class AuthenticationError(InsightFlowException):
    def __init__(self, message: str = "Could not validate credentials"):
        super().__init__(
            status_code=401,
            error_code="UNAUTHORIZED",
            message=message
        )

class PermissionDeniedError(InsightFlowException):
    def __init__(self, message: str = "You do not have permission to access this resource"):
        super().__init__(
            status_code=403,
            error_code="FORBIDDEN",
            message=message
        )

class SQLSecurityViolation(InsightFlowException):
    def __init__(self, message: str = "SQL contains destructive query operations"):
        super().__init__(
            status_code=400,
            error_code="SQL_SECURITY_VIOLATION",
            message=message
        )

class TenantAccessMismatch(InsightFlowException):
    def __init__(self, message: str = "Tenant ID context mismatch"):
        super().__init__(
            status_code=403,
            error_code="TENANT_ACCESS_MISMATCH",
            message=message
        )
