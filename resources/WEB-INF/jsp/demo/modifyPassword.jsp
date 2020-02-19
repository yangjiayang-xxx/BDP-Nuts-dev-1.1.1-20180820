<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isErrorPage="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<% String contextPath = request.getContextPath(); %>
<html>
<head>
    <title>修改密码demo</title>
</head>
<body>
<div style="float:right">
    <a href = "<%=contextPath%>/logout">退出</a>
</div>

<div>
    <form action="<%=contextPath%>/password/" method="post">
        <%--表单的method不支持put，需要用以下的方式来模拟put--%>
        <input type="hidden" name="_method" value="put"/>

        <label>旧密码：</label>
        <input class="old" name="oldPass" type="text">

        <br>
        <label>新密码：</label>
        <input class="new" name="newPass" type="text">

        <br>

        <button type="submit">提交</button>
    </form>
</div>
</body>
</html>
