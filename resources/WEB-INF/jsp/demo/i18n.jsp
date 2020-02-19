<%@ page language="java" contentType="text/html; charset=UTF-8"%>
<%@taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<% String contextPath = request.getContextPath();%>
<html>
<head>
    <title>SpringMVC I18n demo</title>
</head>
<body>
Language:
<a href="<%=contextPath%>/i18n/hello?lang=zh_CN"><spring:message code="language.cn"/></a> &nbsp;&nbsp;&nbsp;
<a href="<%=contextPath%>/i18n/hello?lang=en_US"><spring:message code="language.en"/></a>
<br><br>
当前语言: ${pageContext.response.locale }
<h1>
    <%--通过spring:message输出内容--%>
    <spring:message code="welcome"/>
</h1>

<spring:message code="introduce"/>
</body>
</html>