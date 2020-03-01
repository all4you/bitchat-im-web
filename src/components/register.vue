<template>
  <div class="wrapper box">
    <div class="hd">
      <h2>BitChat</h2>
      <p>创建与世界的链接</p>
    </div>
    <div class="bd">
      <el-form :model="registerForm" :rules="loginRule" ref="registerForm">
        <el-form-item label="账号" prop="userName">
          <el-input type="userName" v-model="registerForm.userName" placeholder="账号"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" placeholder="密码" type="password"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="register('registerForm')" class="submitBtn" :loading="loading">{{btnText}}</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="ft">
      <router-link to="/login">已有账号，现在登录</router-link>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      registerForm: {
        userName: "",
        password: ""
      },
      // 表单验证，需要在 el-form-item 元素中增加 prop 属性
      loginRule: {
        userName: [
          { required: true, message: "账号不可为空", trigger: "blur" }
        ],
        password: [{ required: true, message: "密码不可为空", trigger: "blur" }]
      },
      loading : false,
      btnText : '注 册'
    };
  },
  created() {},
  methods: {
    register(formName) {
      if (!this.$bs.active()) {
        this.$message.error("当前通道还未建立连接");
        return;
      }
      // 为表单绑定验证功能
      this.$refs[formName].validate(valid => {
        if (valid) {
          let params = {
            userName: this.registerForm.userName,
            password: this.registerForm.password
          };
          this.doLoading(true);
          this.$bs.request("register", params, frameObj => {
            let success = frameObj.success;
            if (success) {
              this.$alert('注册成功，点击确定调转到登录页面', '注册成功', {
                confirmButtonText: '确定',
                callback: action => {
                  // 使用 vue-router 路由到指定页面，该方式称之为编程式导航
                  this.$router.push("/login");
                }
              });
            } else {
              this.$message.error(frameObj.msg);
              this.doLoading(false);
            }
          });
        } else {
          this.$message({
            message: "请输入账号和密码",
            type: "warning"
          });
        }
      });
    },
    doLoading(isLoading) {
      if (isLoading) {
        this.loading = true;
        this.btnText = '注册中';  
      } else {
        this.loading = false;
        this.btnText = '注 册'; 
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.box {
    border: 1px solid #dcdfe6;
    width: 350px;
    margin: 10px auto;
    padding: 30px 35px 35px 35px;
    border-radius: 5px;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    box-shadow: 0 0 25px #909399;
  }
  .wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 30%;
    font-family: Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB,
      Microsoft YaHei, SimSun, sans-serif;
    font-size: 18px;
  }
  .wrapper .hd {
    width: 300px;
  }
  .wrapper .hd h2 {
    font-weight: 400;
    color: #20a0ff;
  }
  .wrapper .hd p {
    font-size: 15px;
    color: #1f2f3d;
  }
  .wrapper .bd {
    width: 300px;
  }
  .wrapper .bd .submitBtn {
    width: 100%;
  }
  .wrapper .bd .el-form-item:last-child {
    margin-bottom: 10px;
  }
  .wrapper .ft {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 300px;
  }
  .wrapper .ft a {
    font-size: 14px;
    text-decoration: none;
    color: #20a0ff;
  }
</style>