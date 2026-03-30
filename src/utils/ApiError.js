class ApiError extends Error {
    constructor(statusCode,message,error=[]){
        super(message);
        this.statusCode=statusCode;
        this.error=error;
        this.success=false;
        Error.captureStackTrace(this,this.constructor);
    }
}

export default ApiError;