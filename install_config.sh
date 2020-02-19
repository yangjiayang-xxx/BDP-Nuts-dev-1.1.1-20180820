#安装配置，如从globe.common.conf中将配置的值替换到某个业务的配置中
#$GLOBE_COMMON_CONF为全局的配置文件对象
#WORK_DIR为当前工作目录，即与globe.common.conf平级的目录

##业务配置，举例如下：
#xxxConf=$WORK_DIR/webapp/WEB-INF/classes/config/xxx/xxx-spring.properties

##读取业务的properties中的值，放入变量中
#xxx_datasource_url=`cat $GLOBE_COMMON_CONF  | grep '^xxx.datasource.url' | cut -d= -f2`
#xxx_datasource_username=`cat $GLOBE_COMMON_CONF  | grep '^xxx.datasource.username' | cut -d= -f2`
#xxx_datasource_password=`cat $GLOBE_COMMON_CONF  | grep '^xxx.datasource.password' | cut -d= -f2`

##替换业务的properties中的值
#sed -i "s#xxx.datasource.url.*#xxx.datasource.url=${xxx_datasource_url}#g" $xxxConf
#sed -i "s#xxx.datasource.username.*#xxx.datasource.username=${xxx_datasource_username}#g" $xxxConf
#sed -i "s#xxx.datasource.password.*#xxx.datasource.password=${xxx_datasource_password}#g" $xxxConf