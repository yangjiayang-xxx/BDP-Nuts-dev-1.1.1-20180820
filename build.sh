#!/bin/sh

CONF_FILE=build.properties
MODULE_VERSION=`cat ${CONF_FILE} | grep package.version | awk -F '=' '{print $2}'`
PACKAGE_NAME=`cat ${CONF_FILE} | grep package.name | awk -F '=' '{print $2}'`
PACKAGE_PATH=`cat ${CONF_FILE} | grep package.build | awk -F '=' '{print $2}'`
OS_VERSION=`cat ${CONF_FILE} | grep os.type | awk -F '=' '{print $2}'`

# yyyyMMdd格式的时间戳
timeStamp=`date "+%Y%m%d"`
DEST_FILE_NAME=${PACKAGE_NAME}-install-runtime-${MODULE_VERSION}-${OS_VERSION}-${timeStamp}.tar.gz

#日志函数
writeLog() {
    # print time
    time=`date "+%D %T"`
    echo "[$time] : $PACKAGE_NAME Build : $*"
}

#定义当前工作目录
WORK_DIR=`pwd`

#第一个参数为编译的目标文件路径，第二个参数为编译类型
DEST_DIR=$WORK_DIR/$PACKAGE_PATH
BUILD_TYPE=$1

# 脚本使用提示
usage() {
    echo "---------------------------Usage---------------------------------------"
    echo " sh build.sh <BUILD_TYPE>"
    echo " Example:"
    echo " sh build.sh runtime            Build runtime package."
}

#使用ant编译、打包
build() {
    ant -f $WORK_DIR/build.xml
}

md5product(){
   if [ -z $DEST_FILE_NAME ]; then
      echo "md5sum failed! - target file is not exist."
   else
      echo "md5sum start..."
	  md5sum $DEST_DIR/$DEST_FILE_NAME | cut -d ' ' -f1 > $DEST_DIR/$DEST_FILE_NAME.md5
	  echo "md5sum end..."
   fi

   #拷贝release-note
   cp -f $WORK_DIR/release-note $DEST_DIR
}

#根据输入参数判断使用哪种方式编译
case "$BUILD_TYPE" in
    runtime)
        build
        md5product
        ;;
    *)
    writeLog "ERROR: Input param error!"
    # 参数输入错误时调用usage
    usage
    exit 1
esac