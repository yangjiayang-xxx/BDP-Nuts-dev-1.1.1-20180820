package com.nuts.fs.controller.base;

import org.springframework.web.bind.annotation.ExceptionHandler;

public abstract class BaseController {

    @ExceptionHandler
    public Object exception(Exception e) {
        return error(e);
    }

    protected Object success(Object object) {
        return object;
    }

    protected Object error(Object object) {
        return object;
    }
}
