<template> 
    <v-container fluid> 
        <div style="display: flex;">
            지정일 존재시 자료 미입력 처리
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="save">저장</v-btn>
        </div>
        <v-data-table ref="kpi1" :headers="kpi1Head"  :items="data"
            item-key="date" single-select v-model="kip1S"        
            hide-default-footer :items-per-page="-1" 
            class="elevation-1 text-no-wrap" :item-class= "row_classes">  
        </v-data-table>
    </v-container>
</template>

<script>
export default {
    name: "kpiManagerWizard",
    props: {
        data : null,
    },
    data() {
        return {
            kpi1Head:[                
                {text: '날자',       value: 'date',  sortable: false, align:'center', width: "100px"},
                {text: '예약시간',   value: 'time',  sortable: false, align:'center', width: "100px"},
                {text: '시스템가동여부',  value: 'yn',  sortable: false, align:'center', width: "50px"},
            ],
            kip1S:[],
        }
        
    },
    methods: {
        async save() {            
            await this.$axios.post(`/api/kpi/saveKPI1Wizard`, this.data);             
            this.$toast.info(`저장 하였습니다....`);            
        }
    }

}
</script>

<style>

</style>