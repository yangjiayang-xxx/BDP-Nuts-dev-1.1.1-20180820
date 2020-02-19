package com.nuts.demo.curd.dao;

/**
 * Created by Administrator on 2018/3/6.
 */
//@Repository
public class DemoDAO{

//    @Resource
//    private  JdbcTemplate xxx_jdbcTemplate;//详细使用说明见Spring JDBCTemplate官方文档
//
//    public void save(UserEntity user){
//        xxx_jdbcTemplate.update("insert into table_demo (id,name,age) values(?,?,?)",new Object[]{user.getId(),user.getUsername(),user.getAge()});
//    }
//
//
//    public List<UserEntity> queryEntities() throws SQLException{
//        String sql = "select * from table_demo";
//        List<UserEntity> list = xxx_jdbcTemplate.query(sql, new BeanPropertyRowMapper(UserEntity.class));
//        return list;
//    }
//
//
//    public List<UserEntity> queryForPageList(String username, Page page){
//        String pageSql = "select id,name as username,age from table_demo order by id limit ?,?";
//        List<UserEntity> list = xxx_jdbcTemplate.query(pageSql, new BeanPropertyRowMapper(UserEntity.class),page.getPageNo()-1,page.getPageItems());
//
//        page.setTotalRows(xxx_jdbcTemplate.queryForObject("select count(1) from table_demo limit ?,?",Integer.class,page.getPageNo()-1,page.getPageItems()));
//        return list;
//    }
//
//
//
//    public void delete(String id){
//        xxx_jdbcTemplate.update("delete from table_demo where id=?",id);
//    }
//
//    public void update(UserEntity user){
//        xxx_jdbcTemplate.update("update table_demo set id=?,name=?,age=?",new Object[]{user.getId(),user.getUsername(),user.getAge()});
//    }
}
