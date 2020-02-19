#! /bin/sh

#参数的个数
PARAM_COUNT=$#

#当前路径，即install.sh文件所在的路径
WORK_DIR=`pwd`

#安装配置文件路径
GLOBE_COMMON_CONF=$WORK_DIR/globe.common.conf
INSTALL_CONFIG_SH=$WORK_DIR/install_config.sh

#替换掉\r字符。
sed -i "s/\r//" $GLOBE_COMMON_CONF
sed -i "s/\r//" $INSTALL_CONFIG_SH


#Tomcat路径
TOMCAT_DIR=`cat $GLOBE_COMMON_CONF  | grep '^TOMCAT_DIR' | cut -d= -f2`

#工程名
PROJECT_NAME=`cat $GLOBE_COMMON_CONF  | grep '^PROJECT_NAME' | cut -d= -f2`

#安装路径
INSTALL_PATH=`cat $GLOBE_COMMON_CONF  | grep '^INSTALL_PATH' | cut -d= -f2`

# 界面安装路径，全部安装到web目录中
INSTALL_PATH=$INSTALL_PATH/web




#将globe.common.conf中的业务配置信息写入业务的xxx.properties文件中
configThirdProperties(){
    #执行业务配置
    source $INSTALL_CONFIG_SH
}





#将globe.common.conf中的脚手架配置信息写入system.properties文件中
configSystemProperties() {
	#脚手架配置必填参数
	systemConf=$WORK_DIR/webapp/WEB-INF/classes/system.properties

	#读取globe.common.conf中的值，放入变量中
    cas_home=`cat $GLOBE_COMMON_CONF  | grep '^cas.home' | cut -d= -f2`
    ip_home=`cat $GLOBE_COMMON_CONF  | grep '^ip.home' | cut -d= -f2`
    local_home=`cat $GLOBE_COMMON_CONF  | grep '^local.home' | cut -d= -f2`
    ip_topoptid=`cat $GLOBE_COMMON_CONF  | grep '^ip.topoptid' | cut -d= -f2`

    ##替换system.properties中的值
    sed -i "s#cas.home.*#cas.home=${cas_home}#g" $systemConf
    sed -i "s#ip.home.*#ip.home=${ip_home}#g" $systemConf
	sed -i "s#local.home.*#local.home=${local_home}#g" $systemConf
	sed -i "s#ip.topoptid.*#ip.topoptid=${ip_topoptid}#g" $systemConf
	sed -i "s#app.key.*#app.key=${PROJECT_NAME}#g" $systemConf
}


#定义记录日志的函数
writeLog(){
    # print time
    time=`date "+%D %T"`
    echo "[$time] : WEBAPP-INSTALL : $*"
}


#初始化，检测环境
init() {

    #安装目录中是否有webapp目录
    if [ ! -d $WORK_DIR/webapp ]; then
        writeLog "ERROR: install package has no webapp folder, install will exit"
        exit 1
    fi

    #指定的tomcat路径是否存在
    if [ ! -d $TOMCAT_DIR ]; then
        writeLog "ERROR: Tomcat can't found in $TOMCAT_DIR, install will exit"
        exit 1
    fi

}



#拷贝项目到安装目录中
copyWebapp() {
    writeLog "INFO: Copying webapp to ${INSTALL_PATH}"
    rm -rf ${INSTALL_PATH}/${PROJECT_NAME}_install/WEB-INF/classes/com
    rm -rf ${INSTALL_PATH}/${PROJECT_NAME}_install/WEB-INF/lib
    cp -r $WORK_DIR/webapp/* ${INSTALL_PATH}/${PROJECT_NAME}_install/
}



#将项目部署到tomcat中
deployToTomcat() {
    writeLog "INFO: Deploying webapp to tomcat..."

    localhostDir=${TOMCAT_DIR}/conf/Catalina/localhost

    echo "<Context path=\"/${PROJECT_NAME}\" docBase=\"${INSTALL_PATH}/${PROJECT_NAME}_install\" reloadable=\"false\" crossContext=\"true\"></Context>" > ${PROJECT_NAME}.xml
    if [ ! -d $localhostDir ]; then
        writeLog "The Catalina/localhost folder for tomcat is not exist, I will make it for you!"
        mkdir -p $localhostDir
    fi
    mv ${PROJECT_NAME}.xml $localhostDir/${PROJECT_NAME}.xml

    writeLog "INFO: Cheking whether tomcat is running...."
    COUNT=`ps -ef | grep -v grep | grep -c $TOMCAT_DIR`
    if [ ${COUNT} -ne 0 ]; then
        pid=`ps -ef | grep $TOMCAT_DIR | grep -v grep | awk -F ' ' '{print $2}'`
        writeLog "INFO: Tomcat is running, pid is ${pid}, killing"
        kill -9 ${pid}
    fi
    writeLog "INFO: Starting tomcat..."
    sh ${TOMCAT_DIR}/bin/startup.sh
}


# 备份程序，以防止出现安装新版本的时候安装失败且老版本已经被删除，导致系统不能使用的情况。备份文件最多只保留五份
backup() {
	# 程序安装路径（需要备份的目录路径）
	APP_DIR=${INSTALL_PATH}/${PROJECT_NAME}_install
	# 日期戳
	timeStamp=`date "+%Y%m%d%H%M%S"`
    BACKUP_DIR=${APP_DIR}_bak_${timeStamp}
    if [ -d "$APP_DIR" ];then
        if [ ! -d "$BACKUP_DIR" ];then
            # 如果程序的目录不存在，并且今天没有备份过
            writeLog "INFO: Backup app..."
            cp -rf ${APP_DIR} ${BACKUP_DIR}
        fi
    else
        #创建安装目录
        writeLog "INFO: Web folder is not exist, I will make it for you!"
        mkdir -p ${INSTALL_PATH}/${PROJECT_NAME}_install
    fi


    #删除多余的备份文件
    declare -a bakFiles
    	declare -a bakDates
    	arrayIndex=0
    	regex="^${PROJECT_NAME}_install_bak_[0-9][0-9]*$"
    	FILES=`ls $INSTALL_PATH -t|grep $regex`
    	for file in $FILES
    	do
    		if [ ! -d $INSTALL_PATH/$file ];then
    			continue;
    		fi
    		date=`echo $file|awk -F "_" '{print $4}'`
    		## 4这个数字是自己安装目录名称改成备份名称后，用下划线分割后日期所在的位置！！！
    		## 例如：${PROJECT_NAME}_install_bak_20140127155258，则这个目录名用下划线分割后，20140127155258这个日期在第4个位置。
    		bakFiles[$arrayIndex]=$file
    		bakDates[$arrayIndex]=$date
    		arrayIndex=`expr $arrayIndex + 1`
    	done

    	if [ $arrayIndex -gt 5 ];then
    		for (( i=0; i<$arrayIndex; ++i ))
    		do
    			for (( j=$i+1; j<$arrayIndex; ++j ))
    			do
    				if [ ${bakDates[$i]} -lt ${bakDates[$j]} ];then
    					tmpName=${bakFiles[$i]}
    					tmpDate=${bakDates[$i]}
    					bakFiles[$i]=${bakFiles[$j]}
    					bakDates[$i]=${bakDates[$j]}
    					bakFiles[$j]=$tmpName
    					bakDates[$j]=$tmpDate
    				fi
    			done
    		done
    		for (( i=3; i<$arrayIndex; ++i ))
    		do
    			rm -rf $INSTALL_PATH/${bakFiles[$i]}
    		done
    	fi
}


#安装
install() {



    #初始化，检测环境
    init

    #备份
    backup

    #写入配置
    configSystemProperties

    #配置第三方属性
    configThirdProperties

    #拷贝项目到安装目录
    copyWebapp

    #发布到tomcat中
    deployToTomcat
}

install
