<%@ page language="java" pageEncoding="UTF-8" contentType="text/html; UTF-8" %>
<%@ page isELIgnored="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<% String contextPath = request.getContextPath();
%>
<!DOCTYPE html>
<html lang="en">
<head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=Edge,chrome=1">
        <title>登录</title>
        <script type="text/javascript" src="<%=contextPath%>/assets/fh-ui/js/lib/jquery/jquery.js"></script>
        <script type="text/javascript" src="${casHome}/js/bdpLogin.js"></script>
</head>
<body>
<div class="content">
        <h1>自定义登录页面demo</h1>
</div>
<div id="loginPlaceHolder">

</div>
</body>

<script type="text/javascript">

    // 调用CAS的API
    $("#loginPlaceHolder").casLogin({
        casHome:"<%=request.getAttribute("casHome")%>",
        supportAuthTypes: ["password", "finger", "pki"],
        currentAuthType: "password",
        moduleName: "demo",
        loginUrl : "<%=request.getAttribute("localHome")%>",
        error: function(errorMsg) {
            alert(errorMsg);
        }
    });
</script>
</html>