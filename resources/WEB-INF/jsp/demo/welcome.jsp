<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%--<c:redirect url="/system/mainframe/index" />--%>
<% String contextPath = request.getContextPath();%>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>NUTS脚手架DEMOS</title>
    <script src="<%=contextPath%>/assets/fh-ui/js/lib/jquery/jquery.min.js" type="application/javascript"></script>
</head>
<body>

欢迎进入NUTS脚手架

<br><br>
<a href="<%=contextPath%>/file/page">上传下载Demo</a><br><br>
<a href="<%=contextPath%>/users/page">增删改查</a><br><br>
<a href="<%=contextPath%>/i18n/hello">国际化</a><br><br>
<a href="<%=contextPath%>/view/page">视图解析</a><br><br>
<a href="<%=contextPath%>/login/needAuth">打开页面没有登录时，跳转到登录页面；如已登录，跳转到修改密码页面</a><br><br>

</body>
</html>