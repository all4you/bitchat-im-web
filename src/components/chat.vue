<template>
  <div class="hello">
    <el-row type="flex" class="row-bg" justify="center">
      <el-col :span="1" class="tab-bar">
        <div class="grid-content bg-purple">
          <div class="user">{{myName}}</div>
        </div>
      </el-col>
      <el-col :span="3" class="chat-list">
        <div class="grid-content bg-purple-light">
          <div tag="li" v-for="(item,index) in onlineUsers" :key="index" @click="showP2PChat(item)">
            <div class="user-item">{{item.userName}}({{item.userId}})</div>
          </div>
        </div>
      </el-col>
      <el-col :span="20" class="chat-area">
        <div class="grid-content bg-purple">
          <p2p-chat :p2pChatInfo="p2pChatInfo"></p2p-chat>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import p2pChat from "@/components/p2pchat.vue";
export default {
  data() {
    return {
      onlineUsers: [], // 除我之外的所有在线的用户
      chatMsgsMap: new Map(), // 我与所有在线用户的聊天数据
      myId: "", // 登录之后需要将我的session信息存储起来
      myName: "",
      p2pChatInfo: null, // 我与某个用户的聊天信息
      currentPartenerId: null
    };
  },
  components: {
    p2pChat
  },
  created() {
    this.init();
    this.initUsers();
    this.waitData();
  },
  methods: {
    init() {},
    async initUsers() {
      if (!this.$bs.active()) {
        await this.$sleep(1000);
      }
      this.$bs.request("getOnlineUser", {}, frameObj => {
        let success = frameObj.success;
        console.log("frameObj:", frameObj);
        if (success) {
          let users = JSON.parse(frameObj.resultJson);
          if (users && users != null) {
            this.onlineUsers = users;
          }
        }
      });
    },
    waitData() {
      this.$bs.channelRead(frameObj => {
        let type = frameObj.type;
        if (type == this.$bs.type().COMMAND) {
          let commandName = frameObj.commandName;
          let content = JSON.parse(frameObj.contentJson);
          // 有新的消息
          if (commandName == "transferMsg") {
            let sender = content.partnerId;
            let senderName = content.partnerName;
            let newMsg = {
              sender: sender,
              senderName: senderName,
              receiver: this.myId,
              time: null,
              msg: content.msg
            };
            let p2pChatMsgs = this.chatMsgsMap.get(sender) || [];
            p2pChatMsgs.push(newMsg);
            this.chatMsgsMap.set(sender, p2pChatMsgs);

            // 更新消息
            if (this.currentPartenerId == sender) {
              let p2pChatMsgs = this.chatMsgsMap.get(sender) || [];
              this.p2pChatInfo = {
                myId: this.myId,
                myName: this.myName,
                partnerId: sender,
                partnerName: senderName,
                p2pChatMsgs: p2pChatMsgs
              };
            }
            // 有新用户登录
          } else if (commandName == "newUserLogin") {
            this.onlineUsers.push({
              userId: content.userId,
              userName: content.userName
            });
          }
        }
      });
    },
    showP2PChat(userInfo) {
      let userId = userInfo.userId;
      let userName = userInfo.userName;
      this.currentPartenerId = userId;
      let p2pChatMsgs = this.chatMsgsMap.get(userId) || [];
      this.p2pChatInfo = {
        myId: this.myId,
        myName: this.myName,
        partnerId: userId,
        partnerName: userName,
        p2pChatMsgs: p2pChatMsgs
      };
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.tab-bar {
  background: rgb(33, 37, 43);
  color: #fff;
  height: 600px;
}
.chat-list {
  background: #999;
  height: 600px;
}
.user-item {
  padding: 5px 0px;
  background: rgb(131, 132, 133);
  border-bottom: solid 1px rgb(33, 37, 43);
  color: #fff;
}
.chat-area {
  background: #fff;
  border-top: solid 1px rgb(131, 132, 133);
  border-right: solid 1px rgb(131, 132, 133);
  border-bottom: solid 1px rgb(131, 132, 133);
  height: 600px;
}
</style>
