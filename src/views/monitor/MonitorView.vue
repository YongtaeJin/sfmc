<template>
    <v-container fluid>        
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title> 설비모니터링 주소 : {{siteaddr}}</v-toolbar-title>
            <v-spacer/>
            <v-btn @click="openNewWindow" color="green">새창열기</v-btn>
        </v-toolbar>        
        <iframe width="100%" :style="{ height: iframeHeight + 'px' }" :src=siteaddr></iframe>
    </v-container>  
    
</template>

<script>
export default {
    created() {
        // window.location.href = "http://121.177.37.156:201/monitoring_list_machine.php";
    },
    data() {
        return {
            iframeHeight: 500, // 초기 높이 설정 (원하는 높이로 초기화)            
            siteaddr : "",
        };
    },
    mounted() {
        // 창 크기가 변경될 때마다 iframe의 높이를 조정
        window.addEventListener('resize', this.adjustIframeHeight);
        this.adjustIframeHeight(); // 초기 조정 
        this.init() ;       
    },
    beforeDestroy() {
        // 컴포넌트가 파기될 때 리스너 제거
        window.removeEventListener('resize', this.adjustIframeHeight);
    },
    methods: {
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 180;
        },
        async init() {
            const data = await this.$axios.post(`/api/system/getMoniteraddr`);
            this.siteaddr = data.t_monitor;            
        },
        openNewWindow() {
            // 새 창을 열고 URL을 설정합니다.
            window.open(this.siteaddr, '_blank');
        },
    },
}
</script>

<style>

</style>