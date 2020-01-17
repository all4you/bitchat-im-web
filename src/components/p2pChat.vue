<template>
  <div v-if="p2pChatInfo != null">
    <div class="partner-title">{{p2pChatInfo.partnerName}}</div>
    <div class="p2p-chat-list">
      <div
        v-for="(item,index) in p2pChatInfo.p2pChatMsgs"
        :key="index"
        class="partner"
        :class="item.sender==p2pChatInfo.myId ? 'me' : ''"
      >
        <el-image :src="item.avatar" style="width:30px; height:30px">
          <div slot="error" class="image-slot">
            <i class="el-icon-picture-outline" style="font-size:30px;"></i>
          </div>
        </el-image>
        <div class="msg-box">
          <div class="msg-box-svg">
            <svg>
              <use
                xmlns:xlink="http://www.w3.org/1999/xlink"
                :xlink:href="item.sendobject !== 1 ? '#trigon-right' : '#trigon-left'"
              />
            </svg>
          </div>
          <div class="msg-box-text">{{item.msg}}</div>
        </div>
      </div>
    </div>
    <div>
      <div class="tool-bar">
        <el-row type="flex" class="row-bg" justify="center">
          <el-col :span="1" class="tab-bar">
            <i class="el-icon-picture"></i>
          </el-col>
          <el-col :span="22" class="tab-bar"></el-col>
          <el-col :span="1" class="tab-bar">
            <i class="el-icon-question"></i>
          </el-col>
        </el-row>
      </div>
      <div class="input-area">
        <el-input type="textarea" :rows="5" placeholder="请输入内容" v-model="chatMsg"></el-input>
      </div>
      <div class="send-bar">
        <el-button type="primary" @click="send()">发 送</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chatMsg: ""
    };
  },
  props: {
    p2pChatInfo: {
      myId: String,
      myName: String,
      partnerId: String,
      partnerName: String,
      p2pChatMsgs: Array
    }
  },
  mounted() {},
  methods: {
    send() {
      if (!this.$bs.active()) {
        this.$message("当前通道还未建立连接");
        return;
      }
      let params = {
        partnerId: this.p2pChatInfo.partnerId,
        channelType: 2,
        messageType: 1,
        msg: this.chatMsg
      };

      this.$bs.request("sendP2PMsg", params, frameObj => {
        let success = frameObj.success;
        console.log("frameObj:", frameObj);
        if (success) {
          console.log("发送成功");
          this.p2pChatInfo.p2pChatMsgs.push({
            sender: this.p2pChatInfo.myId,
            senderName: this.p2pChatInfo.myName,
            receiver: this.p2pChatInfo.partnerId,
            time: new Date(),
            msg: this.chatMsg
          });
          this.chatMsg = '';
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
@import "src/style/public";
.partner-title {
  padding: 10px 0px;
  border-bottom: solid 1px #999;
  background: #666;
  font-weight: bold;
  font-size: 14px;
}
.p2p-chat-list {
  height: 350px;
  border-bottom: solid 1px #999;
  overflow-x: hidden;
  overflow-y: auto;
}

.partner {
  @include justify(flex-start);
  margin-bottom: 0.512rem;
  align-items: top;
  padding: 10px;
  img {
    display: block;
    @include widthHeight(1.7493333333rem, 1.7493333333rem);
  }
  .msg-box {
    position: relative;
    .msg-box-svg {
      @include widthHeight(0.4266666667rem, 0.64rem);
      position: absolute;
      top: 0.5546667rem;
      left: 0.36rem;
      z-index: 2;
      svg {
        display: block;
        @include widthHeight(0.4266666667rem, 0.64rem);
      }
    }
    .msg-box-text {
      margin-left: 0.6399997rem;
      max-width: 10.3253333333rem;
      background: #fff;
      padding: 0.42rem 0.384rem;
      border: 1px solid #d9d9d9;
      border-radius: 8px;
      @include sizeColor(0.64rem, #333);
      line-height: 0.8533333333rem;
      word-break: break-all;
    }
  }
}
.me {
  display: flex;
  flex-direction: row-reverse;
  .msg-box {
    .msg-box-svg {
      right: 0.36rem;
      left: auto;
    }
    .msg-box-text {
      margin-right: 0.6399997rem;
      margin-left: 0;
      background: #9fe658;
    }
  }
}

.tool-bar {
  padding: 0px 10px;
}
.input-area {
  padding: 0px 10px;
}
.send-bar {
  margin: 10px 10px 5px 0px;
  text-align: right;
}
</style>