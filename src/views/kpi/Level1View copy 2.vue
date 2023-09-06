<template>
    <v-container fluid> 
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>KPI 핵심성과지표 레벨1</v-toolbar-title>
            <v-spacer/>
            조회년월 :             
            <tooltip-btn label="전월"   @click="prevMon"><v-icon>mdi-chevron-left</v-icon></tooltip-btn> 
            {{ cleandarYM }}
            <tooltip-btn label="다음월" @click="nextMon"><v-icon>mdi-chevron-right</v-icon></tooltip-btn> 
            <tooltip-btn label="조회"   @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn> 
        </v-toolbar>
        <v-sheet >
            <v-calendar
                ref="calendar"
                v-model="focus"
                color="primary"
                :events="events"
                :event-color="getEventColor"
                :type="type"
                @click:event="showEvent"
                @click:more="viewDay"
                @click:date="viewDay"
                @change="updateRange"
                ></v-calendar>
        </v-sheet>
    </v-container>
    
</template>

<script>
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import { getDate } from '../../../util/lib';
export default {
    components: { TooltipBtn },
    mounted() {        
        this.init();
        this.$refs.calendar.checkChange();
    }, 
    data() {
        return {
            ym : {y:0, m:0}, 
            siteKpiifno : {i_company:"",  i_kpikey:""},
            form : {s_ym:"", f_tst:"Y"},
            systmOprYn: true,
            selectdata : {t_no: 0, c_com: "", kpiCertKey: "", ocrDttm: "", systmOprYn: "Y", trsDttm: "", f_tst: "Y", t_req: "", t_res: "", f_err: ""},
            masterHead: [
                {text: '날자',   value: 's_day',  sortable: false, align:'center', width: "55px"},                
                {text: '처리',   value: 'm_cnt',  sortable: false, align:'center', width: "40px"},                
                {text: '성공',   value: 'm_ok',   sortable: false, align:'center', width: "40px" },
                {text: '실패',   value: 'm_no',   sortable: false, align:'center', width: "40px" },
            ],
            masters:[], masterinfo:[], selectedM: [],
            itemHead: [
                {text: 'kpiCertKey', value: 'kpiCertKey',  sortable: false, align:'center', width: "55px"},
                {text: 'ocrDttm',    value: 'ocrDttm',  sortable: false, align:'center', width: "55px"},
                {text: 'systmOprYn', value: 'systmOprYn',  sortable: false, align:'center', width: "55px"},
                {text: 'trsDttm',    value: 'trsDttm',  sortable: false, align:'center', width: "55px"},
                {text: 'error',       value: 'f_err',  sortable: false, align:'center', width: "55px"},
                
            ],
            itemLists: [], itemListsselect: [],  itemInfo: [], selectedD: [],

            focus: '',
            type: 'month',
            selectedEvent: {},
            selectedElement: null,
            selectedOpen: false,
            events: [],
            colors: ['blue', 'indigo', 'deep-purple', 'cyan', 'green', 'orange', 'grey darken-1'],
            names: ['Meeting', 'Holiday', 'PTO', 'Travel', 'Event', 'Birthday', 'Conference', 'Party'],
     
        }
    },
    computed: {
        cleandarYM() {
            return `${this.ym.y}년 ${String(this.ym.m + 1).padStart(2, '0')}월`;
        } 
    },
    watch: {
        ym: {
            deep: true,
            handler(newItems, oldItems) {this.form.s_ym = this.yyyymm(); },            
        },
        systmOprYn: {
            handler(newItems, oldItems) {this.selectdata.systmOprYn = newItems ? 'Y' : 'N'}
        },

    },
    methods: {
        async init() {
            const now = new Date(Date.now());
            this.ym.y = now.getFullYear();
            this.ym.m = now.getMonth();
            this.siteKpiifno = await this.$axios.get(`/api/system/getSiteKpiInfo`); 
            this.selectdata.c_com = this.$store.state.user.member.c_com;             
            this.selectdata.kpiCertKey = this.siteKpiifno.i_kpikey;
            
        },
        viewDay ({ date }) {
            this.focus = date
            // this.type = 'day'
            console.log(date)
        },
        getEventColor (event) {return event.color},
        yyyymm() {
            return `${this.ym.y}${String(this.ym.m + 1).padStart(2, '0')}`;
        },
        showEvent ({ nativeEvent, event }) {
            const open = () => {
                this.selectedEvent = event
                this.selectedElement = nativeEvent.target
                requestAnimationFrame(() => requestAnimationFrame(() => this.selectedOpen = true))
            }

            if (this.selectedOpen) {
                this.selectedOpen = false
                requestAnimationFrame(() => requestAnimationFrame(() => open()))
            } else {
                open()
            }
            nativeEvent.stopPropagation()
        },
        updateRange ({ start, end }) {
            const events = []

            const min = new Date(`${start.date}T00:00:00`)
            const max = new Date(`${end.date}T23:59:59`)
            const days = (max.getTime() - min.getTime()) / 86400000
            const eventCount = this.rnd(days, days + 20)

            for (let i = 0; i < eventCount; i++) {
                const allDay = this.rnd(0, 3) === 0
                const firstTimestamp = this.rnd(min.getTime(), max.getTime())
                const first = new Date(firstTimestamp - (firstTimestamp % 900000))
                const secondTimestamp = this.rnd(2, allDay ? 288 : 8) * 900000
                const second = new Date(first.getTime() + secondTimestamp)

                events.push({
                    name: this.names[this.rnd(0, this.names.length - 1)],
                    start: first,
                    end: second,
                    color: this.colors[this.rnd(0, this.colors.length - 1)],
                    timed: !allDay,
                })
            }
            this.events = events
        },
        rnd (a, b) {
            return Math.floor((b - a + 1) * Math.random()) + a
        },

        prevMon() {
            if (this.ym.m == 0) {
                this.ym.m = 11;
                this.ym.y = this.ym.y - 1;
            } else {
                this.ym.m = this.ym.m  - 1;
            }
            this.$refs.calendar.prev()            
        },
        nextMon(){
            if (this.ym.m == 11) {
                this.ym.m = 0;
                this.ym.y = this.ym.y + 1;
            } else {
                this.ym.m = this.ym.m  + 1;
            }
            this.$refs.calendar.next()
        },
        async view() {   
            this.masterinfo = []; this.selectedM = []; this.itemLists = []; this.itemListsselect = [] ,this.itemInfo = [];         
            this.masters = await this.$axios.post(`/api/kpi/getKpi1`,  this.form);      
            this.itemLists = await this.$axios.post(`/api/kpi/getKpi1dt`, this.form);       
        },


        async kpi1Test1() {
            console.log("kpi1Test1")
            const rv = await this.$axios.post(`/api/kpi/sendKpi1`, this.selectdata);
            console.log(rv);
            
        },
        async kpi1Test2() {
            const rv = await this.$axios.post(`/api/kpi/loadKpi1`);
            
        },
        async rowSelectMaster(item, row) {
            if(this.masterinfo.s_day == item.s_day) return;
            
            this.masterinfo = item;
            if (row) { row.select(true) } else { this.selectedM = [item] }; 
            
            this.selectdata.ocrDttm = item.s_date;            
            this.selectedD = []; 
            this.itemInfo = [];
            if (this.itemLists.length > 0) {
                this.itemListsselect = this.itemLists.filter((r) => {
                    return r.ocrDttm == item.ocrDttm && r.c_com == item.c_com;
                }); 
            } else {
                this.itemListsselect = [];
            }
        },    
        rowSelectDetail(item, row) {
            this.itemInfo = item;
            if (row) { row.select(true) } else { this.selectedD = [item] };
        },
    }

}
</script>

<style>

</style>