<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isErrorPage="true" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<% String contextPath = request.getContextPath(); %>
<html>
<head>
    <title>CURD demo</title>
    <script src="<%=contextPath%>/assets/lib/jquery.js" type="text/javascript"></script>
</head>
<body>

<br>
添加示例
<br><br>
<form action="<%=contextPath%>/users/" method="post">
    <input type="text" name="id" placeholder="ID" value=""/>
    <input type="text" name="username" placeholder="用户名" value=""/>
    <input type="text" name="age" placeholder="年龄" value=""/>
    <button type="submit">提交</button>
</form>
<br>
<br>
<br>
修改示例
<br><br>
<form action="<%=contextPath%>/users/" method="post">
    <%--表单的method不支持put，需要用以下的方式来模拟put--%>
    <input type="hidden" name="_method" value="put"/>

    <input type="text" name="id" placeholder="ID" value=""/>
    <input type="text" name="username" placeholder="用户名" value=""/>
    <input type="text" name="age" placeholder="年龄" value=""/>
    <button type="submit">提交</button>
</form>
<br><br>

<br>
删除示例
<br><br>
<input id="delete_id" type="text" name="id" placeholder="ID" value=""/>
<button type="submit" onclick="deleteUser()">删除</button>

<br><br><br><br>
查询示例
<br><br>
<button type="submit" onclick="search()">模拟分页查询</button>

<br><br>
<div id="searchContent" style="min-width: 100px;min-height: 50px;border:1px solid #888;display: none;"></div>
<pre>
该请求从test_demo表中获取数据。请先在你的库中插入以下数据：
    create table `table_demo` (
    `name` varchar (192),
    `age` int (5),
    `id` varchar (96)
    );
    insert into `table_demo` (`name`, `age`, `id`) values('张三','11','123');
    insert into `table_demo` (`name`, `age`, `id`) values('李四','34','234');
</pre>


</body>
<script>
    function deleteUser(){
        var id = $("#delete_id").val();
        $.ajax({
            url:'<%=contextPath%>/users/'+id,
            type:'delete',
            dataType:'json',
            success:function(rsp){
                alert(rsp.msg+":"+rsp.data);
                console.log(rsp);
            },error:function(rsp){
                console.error('error');
                console.log(rsp);
            }

        });
    }

    function search(){
        $.ajax({
            url:'<%=contextPath%>/users/search?pageNo=1&pageItems=10',
            type:'get',
            success:function(rsp){
                $("#searchContent").html(JSON.stringify(rsp.data))
                alert("查询成功");
                console.log(rsp);
            },error:function(rsp){
                alert("查询失败");
                console.log(rsp);
            }

        });
    }
</script>
</html>
