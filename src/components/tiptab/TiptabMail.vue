<template>
  <v-dialog v-model="dialog" v-bind="$attrs">
    <v-card>
      <v-toolbar color="primary" density="compact" class="elevation-4">
        <v-toolbar-title>{{ label }}</v-toolbar-title>  
        <v-spacer></v-spacer>
        <v-btn v-if="this.itemInput.i_userid" color="primary" class="col-md-1" @click="send">메일발송</v-btn>
        <v-btn dark  class="col-md-1 ml-10" @click="close">닫기</v-btn>      
      </v-toolbar>
      <table>
        <tr>
          <td width="300px"><v-text-field label="수신처 : " v-model="tomail" hide-details></v-text-field></td>
          <td width="200px">
              <tooltip-btn icon label="회원 메일" @click="getEmail('U')"><v-icon large>mdi-email-check</v-icon></tooltip-btn>
              <tooltip-btn icon label="사업등록 메일" @click="getEmail('S')"><v-icon large>mdi-email-mark-as-unread</v-icon></tooltip-btn>
          </td>
          <td width="300px"><v-text-field label="참조 : " v-model="ccmail" hide-details></v-text-field></td>
          <td><tooltip-btn icon label="사용자 메일" @click="getEmail('M')"><v-icon large>mdi-email-mark-as-unread</v-icon></tooltip-btn></td>
        </tr>
      </table>
      

      
      <!-- <v-toolbar density="compact" class="elevation-20">
        <v-text-field label="수신처 :" hide-details></v-text-field>
        <v-text-field label="참조 :" hide-details ></v-text-field>
      </v-toolbar> -->
      
      <v-card-text>
        <slot></slot>
      </v-card-text>
      <div class="editor" v-if="editor">
        <menu-bar class="editor__header" :editor="editor" />
        <menu-color class="editor__header" :editor="editor" />
        <editor-content class="editor__content" :editor="editor" />
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import CharacterCount from '@tiptap/extension-character-count'
import Highlight from '@tiptap/extension-highlight'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import { Color } from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import { Editor, EditorContent } from '@tiptap/vue-2'
import MenuBar from './MenuBar.vue'
import MenuColor from './MenuColor.vue'
import TooltipBtn from "../etc/TooltipBtn.vue";
export default {
  components: {EditorContent, MenuBar, MenuColor, TooltipBtn,},
  name: "TiptabMail",
  props: {
    label: {
      type: String,
      required: true,
    },
    itemInput :{ type: Object, default: null, },
    body_content: { type: String, default: null, },
    mail_title: { type: String,  default: null, },
  },
  data() {
    return {
      dialog: false,
      editor: null, 
      html: null,
      tomail: "",
      ccmail: "",
    };
  },
  mounted() {
    this.editor = new Editor({
      content : this.body_content,                
      extensions: [
        StarterKit.configure({
          history: true,            
        }),
        Document,
        Paragraph,
        Text,
        TextStyle,
        Color,
        TextAlign.configure({
          types: ['heading', 'paragraph'],                  
        }),          
        Highlight.configure({ multicolor: true },),
        TaskList,
        TaskItem,          
        CharacterCount.configure({
          limit: 10000,
        }),          
      ],
      onUpdate({ editor }) {          
        // this.$emit("input", editor.getHTML());
        // this.emitAfterOnUpdate = true;        
      }
    });
  },
  beforeUnmount() {
    this.editor.destroy()
  },
  watch: {
    body_content() {
      this.editor.commands.setContent(this.body_content);
    }
  },
  methods: {
    close() {
      this.$emit('onClose');
      this.dialog = false;      
    },
    open() {
			this.$emit('onOpen');
      this.dialog = true;
      this.tomail="";
      this.ccmail="";
    },
    send() {
      if(!this.tomail) {
        this.$ezNotify.alert("수신처 미입력 .... ", "확인");
        return
      }
      this.html = this.editor.getHTML();      
			this.$emit('onSend', this.mail_title, this.tomail, this.ccmail, this.html);      
    },
    async getEmail(gubun) {            
      let url = null;
      if (gubun == 'U') {
        url = `/api/shopinfo/shopgetEmail?i_userid=${this.itemInput.i_userid}&gubun=${gubun}`;
      } else if (gubun == 'S') {
        url = `/api/shopinfo/shopgetEmail?i_shop=${this.itemInput.i_shop}&i_no=${this.itemInput.i_no}&gubun=${gubun}`;
      } else if (gubun == 'M') {
        url = `/api/shopinfo/shopgetEmail?&gubun=TOKEN`;
      }
      if (url) {
        const data = await this.$axios.get(url);            
        if( data ) {     
          if (gubun == 'M') {
            this.ccmail = data[0].to_email;
          } else {          
            this.tomail = data[0].to_email;
          }
        }
      }
    }
  },
};
</script>

<style lang="scss">
.editor {
  display: flex;
  flex-direction: column;
  max-height: 26rem;
  color: #0D0D0D;
  background-color: #FFF;
  border: 3px solid #0D0D0D;
  border-radius: 0.75rem;

  &__header {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    flex-wrap: wrap;
    padding: 0.25rem;
    border-bottom: 3px solid #0D0D0D;
  }

  &__content {
    // padding: 1.25rem 1rem;
    flex: 1 1 auto;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  &__footer {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    white-space: nowrap;
    border-top: 3px solid #0D0D0D;
    font-size: 12px;
    font-weight: 600;
    color: #0D0D0D;
    white-space: nowrap;
    padding: 0.25rem 0.75rem;
  }

  /* Some information about the status */
  &__status {
    display: flex;
    align-items: center;
    border-radius: 5px;

    &::before {
      content: ' ';
      flex: 0 0 auto;
      display: inline-block;
      width: 0.5rem;
      height: 0.5rem;
      background: rgba(#0D0D0D, 0.5);
      border-radius: 50%;
      margin-right: 0.5rem;
    }

    &--connecting::before {
      background: #616161;
    }

    &--connected::before {
      background: #B9F18D;
    }
  }

  &__name {
    button {
      background: none;
      border: none;
      font: inherit;
      font-size: 12px;
      font-weight: 600;
      color: #0D0D0D;
      border-radius: 0.4rem;
      padding: 0.25rem 0.5rem;

      &:hover {
        color: #FFF;
        background-color: #0D0D0D;
      }
    }
  }
}
</style>

<style lang="scss">
/* Give a remote user a caret */
.collaboration-cursor__caret {
  position: relative;
  margin-left: -1px;
  margin-right: -1px;
  border-left: 1px solid #0D0D0D;
  border-right: 1px solid #0D0D0D;
  word-break: normal;
  pointer-events: none;
}

/* Render the username above the caret */
.collaboration-cursor__label {
  position: absolute;
  top: -1.4em;
  left: -1px;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  user-select: none;
  color: #0D0D0D;
  padding: 0.1rem 0.3rem;
  border-radius: 3px 3px 3px 0;
  white-space: nowrap;
}

/* Basic editor styles */
.ProseMirror {
  > * + * {
    margin-top: 0.75em;
  }

  ul,
  ol {
    padding: 0 1rem;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
  }

  code {
    background-color: rgba(#616161, 0.1);
    color: #616161;
  }

  pre {
    background: #0D0D0D;
    color: #FFF;
    font-family: 'JetBrainsMono', monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    code {
      color: inherit;
      padding: 0;
      background: none;
      font-size: 0.8rem;
    }
  }

  mark {
    background-color: #FAF594;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  hr {
    margin: 1rem 0;
  }

  blockquote {
    padding-left: 1rem;
    border-left: 2px solid rgba(#0D0D0D, 0.1);
  }

  hr {
    border: none;
    border-top: 2px solid rgba(#0D0D0D, 0.1);
    margin: 2rem 0;
  }

  ul[data-type="taskList"] {
    list-style: none;
    padding: 0;

    li {
      display: flex;
      align-items: center;

      > label {
        flex: 0 0 auto;
        margin-right: 0.5rem;
        user-select: none;
      }

      > div {
        flex: 1 1 auto;
      }
    }
  }
}
</style>