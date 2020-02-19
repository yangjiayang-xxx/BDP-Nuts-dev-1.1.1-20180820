<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isErrorPage="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<% String contextPath = request.getContextPath(); %>
<html>
<head>
    <title>视图解析</title>
</head>
<body>
<br><br>
现在配置的解析规则时，优先解析velocity，如果vm视图找不到，才会去尝试解析JSP。示例如下：
<br><br>
<a href="<%=contextPath%>/view/vm">点击这里时，返回demo/demo作为视图名称。WEB-INF/jsp/目录下和WEB-INF/views目录下都存在demo的视图，系统优先匹配demo.vm作为视图返回</a>
<br><br><br>
<a href="<%=contextPath%>/view/jsp">点这里时，返回demo/curd作为视图名称。在WEB-INF/views目录下找不到该视图，再尝试去jsp目录下查找，系统最终返回的是curd.jsp以页面</a>


</body>
</html>
