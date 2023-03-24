<template>
    <div v-if="editor">
        Font Color >>> :  
        <input
            type="color"
            @input="editor.chain().focus().setColor($event.target.value).run()"
            :value="editor.getAttributes('textStyle').color"
        />
        <v-btn class="red white--text" x-small  @click="editor.chain().focus().setColor('#FF3434').run()" :class="{ 'is-active': editor.isActive('textStyle', { color: '#FF3434' })}">빨강</v-btn>
        <v-btn class="yellow" x-small  @click="editor.chain().focus().setColor('#FAF594').run()" :class="{ 'is-active': editor.isActive('textStyle', { color: '#FAF594' })}">노랑</v-btn>
        <v-btn class="blue white--text" x-small  @click="editor.chain().focus().setColor('#70CFF8').run()" :class="{ 'is-active': editor.isActive('textStyle', { color: '#70CFF8' })}">파랑</v-btn>
        <v-btn class="green white--text" x-small  @click="editor.chain().focus().setColor('#B9F18D').run()" :class="{ 'is-active': editor.isActive('textStyle', { color: '#B9F18D' })}">노색</v-btn>
        <v-btn class="black white--text" x-small  @click="editor.chain().focus().setColor('#000000').run()" :class="{ 'is-active': editor.isActive('textStyle', { color: '#000000' })}">검정</v-btn>
        <v-btn class="white" x-small  @click="editor.chain().focus().setColor('#FFFFFF').run()" :class="{ 'is-active': editor.isActive('textStyle', { color: '#FFFFFF' })}">하얀</v-btn>
        <!-- <v-btn @click="clickItem">보기</v-btn> -->
        <!-- Back Color :  -->
        <!-- <input
            type="color"
            @input="editor.chain().focus().toggleHighlight($event.target.value).run()"
            :value="editor.getAttributes('textStyle').color"
        > -->
        <!-- <v-btn class="red" x-small  @click="editor.chain().focus().toggleHighlight('#74c0fc').run()" :class="{ 'is-active': editor.isActive('textStyle', { color: '#74c0fc' })}"></v-btn> -->
        <!-- <v-btn class="yellow" x-small  @click="editor.chain().focus().toggleHighlight('#FAF594').run()" :class="{ 'is-active': editor.isActive('textStyle', { color: '#FAF594' })}"></v-btn>
        <v-btn class="blue" x-small  @click="editor.chain().focus().toggleHighlight('#70CFF8').run()" :class="{ 'is-active': editor.isActive('textStyle', { color: '#70CFF8' })}"></v-btn>
        <v-btn class="green" x-small  @click="editor.chain().focus().toggleHighlight('#B9F18D').run()" :class="{ 'is-active': editor.isActive('textStyle', { color: '#B9F18D' })}"></v-btn> -->
        
    </div>
    
</template>

<script>

export default {
     
    props: {
        editor: {
        type: Object,
        required: true,
        },
    },
    methods : {
        clickItem() {
           console.log("clickItem") ;
           console.log(this.editor.getHTML());
        }
    }
}
</script>

<style>

</style>
