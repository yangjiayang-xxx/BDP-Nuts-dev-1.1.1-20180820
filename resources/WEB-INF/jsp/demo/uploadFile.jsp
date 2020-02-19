<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<% String contextPath = request.getContextPath(); %>
<!DOCTYPE html PUBLIC>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>文件上传演示</title>
</head>
<body>
<h2>文件上传演示</h2>
<%--负责上传文件的表单的编码类型必须是“multipart/form-data”--%>
    <br>
    上传方式一：通过二进制保存文件到服务器
    <br><br>
    <form action="<%=contextPath%>/file/upload" enctype="multipart/form-data" method="post">
    <table>
        <tr>
            <td>文件描述:</td>
            <td><input type="text" name="description"></td>
        </tr>
        <tr>
            <td>请选择文件:</td>
            <td><input type="file" name="files"></td>
            <td><input type="file" name="files"></td>
        </tr>
        <tr>
            <td><input type="submit" value="上传"></td>
        </tr>
    </table>
    </form>

    <br><br>
    <hr/>
    <br><br>
    上传方式二：通过对象的方式上传文件,可以携带任意数据
    <br><br>
    <form action="<%=contextPath%>/file/uploadWithExtra" enctype="multipart/form-data" method="post">
        <table>
            <tr>
                <td>用户名:</td>
                <td><input type="text" name="username"></td>
            </tr>
            <tr>
                <td>年龄:</td>
                <td><input type="text" name="age"></td>
            </tr>
            <tr>
                <td>头像:</td>
                <td><input type="file" name="files"></td>
                <td><input type="file" name="files"></td>
            </tr>
            <tr>
                <td><input type="submit" value="上传"></td>
            </tr>
        </table>
    </form>

    <br><br>
    <hr/>
    <br><br>
    <div>
        已上传的文件:
        <br><br>
        下载方式一：通过JAVA通用输出流的方式下载
        <br><br>
        <c:forEach var="item" items="${files}" >
            <a href="<%=contextPath%>/file/download?filename=${item.name}">
                点击下载 ${item.name}
            </a>
            <br>
            <br>
        </c:forEach>

        <br><br><br>
        <hr/>
        下载方式二：通过springmvc的ResponseEntity
        <br><br>
        <c:forEach var="item" items="${files}" >
            <a href="<%=contextPath%>/file/downloadByEntity?filename=${item.name}">
                点击下载 ${item.name}
            </a>
            <br>
            <br>
        </c:forEach>
    </div>
</body>
</html>