<template>
    <v-container fluid> 
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>KPI 핵심성과지표 관리</v-toolbar-title>
            
            <v-spacer/>
            사업장 : <v-select hide-details dense v-model="form.c_com" :items="workSite" item-text="n_com" item-value="c_com" style="width:20px; max-width:100px;"></v-select>
            
            조회년월 :
            <tooltip-btn label="전월"   @click="prevMon"><v-icon>mdi-chevron-left</v-icon></tooltip-btn> 
            {{ cleandarYM }}
            <tooltip-btn label="다음월" @click="nextMon"><v-icon>mdi-chevron-right</v-icon></tooltip-btn> 
            <tooltip-btn label="조회"   @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn> 
        </v-toolbar>
        <v-row>
            <v-col col="12" sm="6" md="6">
                <v-toolbar height="30px" color="accent">                   
                    <v-toolbar-title>KPI 인증상호: {{ setCom.n_com }}</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-title>인증키값: {{ setCom.i_kpikey }}</v-toolbar-title>
                </v-toolbar>
                <v-data-table ref="table" :headers="masterHead" :items="masters" @click:row="rowSelectMaster" 
                    item-key="s_day" single-select v-model="selectedM"                    
                    hide-default-footer :items-per-page="-1" :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap" :item-class= "row_classes" :height="iframeHeight" > 
                </v-data-table>
            </v-col>
            <v-col col="12" sm="6" md="6">
                <v-toolbar height="30px" color="#c2fad8"> 
                    <v-toolbar-title>선택일자 : {{ getDate }}</v-toolbar-title>                    
                </v-toolbar>
                <v-row>
                    <v-col>
                        <v-toolbar height="30px" background-color="primary" dark> 
                            <v-toolbar-title>KPI 1</v-toolbar-title>
                            <v-spacer/>                            
                            <tooltip-btn x-small label="KPI1 삭제" @click="delKpi('kpi1')"><v-icon>mdi-minus-circle-multiple-outline</v-icon></tooltip-btn>
                            <tooltip-btn x-small label="KPI1 추가" @click="addKpi('kpi1')"><v-icon>mdi-plus-circle-multiple-outline</v-icon></tooltip-btn>
                            <tooltip-btn x-small label="KPI1 추가마법사" @click="appKpidb('kpi1')"><v-icon>mdi-database-edit</v-icon></tooltip-btn>

                        </v-toolbar>
                        <v-data-table ref="kpi1" :headers="kpi1Head"  :items="kpi1ItemFiled" @click:row="rowSelectKpi1" 
                                item-key="t_no" single-select v-model="kip1S"        
                                hide-default-footer :items-per-page="-1" 
                                class="elevation-1 text-no-wrap" :item-class= "row_classes" height="150px" max-height="150px" > 
                                <template v-slot:[`item.f_err`]="{ item }">
                                   {{ getErrName(item.f_err) }}
                                </template>
                        </v-data-table>
                                                
                    </v-col>                    
                </v-row>
                <v-row>
                    <v-col>
                        <v-toolbar height="30px" background-color="primary" dark> 
                            <v-toolbar-title>KPI 2</v-toolbar-title>
                            <v-spacer/>
                            <tooltip-btn x-small label="KPI2 삭제" @click="delKpi('kpi2')"><v-icon>mdi-minus-circle-multiple-outline</v-icon></tooltip-btn>
                            <tooltip-btn x-small label="KPI2 추가" @click="addKpi('kpi2')"><v-icon>mdi-plus-circle-multiple-outline</v-icon></tooltip-btn>
                        </v-toolbar>
                        <v-data-table ref="kpi2" :headers="kpi2Head"  :items="kpi2ItemFiled" @click:row="rowSelectKpi2" 
                                item-key="t_no" single-select v-model="kip2S"        
                                hide-default-footer :items-per-page="-1" 
                                class="elevation-1 text-no-wrap" :item-class= "row_classes" height="150px" max-height="150px" > 
                                <template v-slot:[`item.f_err`]="{ item }">
                                   {{ getErrName(item.f_err) }}
                                </template>
                        </v-data-table>
                    </v-col>                    
                </v-row>
                <v-row>
                    <v-col>
                        <v-toolbar height="30px" background-color="primary" dark> 
                            <v-toolbar-title>KPI 3</v-toolbar-title>
                            <v-spacer/>
                            <tooltip-btn x-small label="KPI3 삭제" @click="delKpi('kpi3')"><v-icon>mdi-minus-circle-multiple-outline</v-icon></tooltip-btn>
                            <tooltip-btn x-small label="KPI3 추가" @click="addKpi('kpi3')"><v-icon>mdi-plus-circle-multiple-outline</v-icon></tooltip-btn>
                        </v-toolbar>
                        <v-data-table ref="kpi3" :headers="kpi3Head"  :items="kpi3ItemFiled" @click:row="rowSelectKpi3" 
                                item-key="t_no" single-select v-model="kip3S"        
                                hide-default-footer :items-per-page="-1" 
                                class="elevation-1 text-no-wrap" :item-class= "row_classes" height="150px" max-height="150px" > 
                                <template v-slot:[`item.f_err`]="{ item }">
                                   {{ getErrName(item.f_err) }}
                                </template>
                        </v-data-table>
                    </v-col>                    
                </v-row>
            </v-col>
        </v-row>

        <ez-dialog ref="dialog_kpi" label="KPI 추가" persistent  width="450px" @onClose="kpi_close">
            <kpi-manager-form @onAdd="modKPIData" :tabindex="kpiindex" :data="setCom" :resTime="ResTime">
            </kpi-manager-form>
            
        </ez-dialog>

        <ez-dialog ref="dialog_wizard" :label=kpi1title persistent width="450px"> 
            <kpi-manager-wizard  :data="kpi1wdata">

            </kpi-manager-wizard>
        </ez-dialog>
    </v-container>
</template>

<script>
import {deepCopy, generateRandomTimes} from '../../../util/lib';
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import EzDialog from '../../components/etc/EzDialog.vue';
import KpiManagerForm from './kpiManagerForm.vue';
import KpiManagerWizard from './kpiManagerWizard.vue';
export default {
    components: { TooltipBtn, KpiManagerForm, EzDialog, KpiManagerWizard },
    mounted() {
        // 창 크기가 변경될 때마다 iframe의 높이를 조정
        window.addEventListener('resize', this.adjustIframeHeight);
        this.adjustIframeHeight(); // 초기 조정
        this.init();
    },
    beforeDestroy() {
        // 컴포넌트가 파기될 때 리스너 제거
        window.removeEventListener('resize', this.adjustIframeHeight);
    },
    create() {        
    },
    data() {
        return {
            iframeHeight : 500,  
            ym : {y:0, m:0}, 
            form : {c_com:"", s_ym:"", f_tst:"Y"},
            workSite:[],
            setCom:{c_com:"", n_com:"", i_kpikey:"", s_day:"", ocrDttm:""},
            kpiindex:0,
            masterHead: [
                {text: '날자',   value: 's_day',  sortable: false, align:'center', width: "80px"},
                {text: 'KPI1 예약시간',   value: 's_k1time',  sortable: false, align:'center', width: "40px"},                
                {text: 'KPI1 전송건수',   value: 'm_k1sent',  sortable: false, align:'center', width: "40px" },
                {text: 'KPI2 예약시간',   value: 's_k2time',  sortable: false, align:'center', width: "40px"},                
                {text: 'KPI2 전송건수',   value: 'm_k2sent',  sortable: false, align:'center', width: "40px" },
                {text: 'KPI3 예약시간',   value: 's_k3time',  sortable: false, align:'center', width: "40px"},                
                {text: 'KPI3 전송건수',   value: 'm_k3sent',  sortable: false, align:'center', width: "40px" },
                
            ],
            masters:[], masterinfo:[], selectedM: [],
            kpi1Head:[
                {text: '전송예약시간',   value: 's_restime',  sortable: false, align:'center', width: "80px"},
                {text: '전송일시',       value: 'trsDttm',  sortable: false, align:'center', width: "80px"},
                {text: '시스템가동여부',  value: 'systmOprYn',  sortable: false, align:'center', width: "80px"},
                {text: '결과',           value: 'f_err',  sortable: false, align:'center', width: "80px"},
            ],
            kpi1Items:[], kpi1ItemFiled:[], kpi1Info:[], kip1S:[],

            kpi2Head:[
                {text: '전송예약시간',   value: 's_restime',  sortable: false, align:'center', width: "80px"},
                {text: '전송일시',       value: 'trsDttm',  sortable: false, align:'center', width: "80px"},
                {text: '성과지표분야코드',  value: 'kpiFldCd',  sortable: false, align:'center', width: "80px"},
                {text: '세부성과지표코드',  value: 'kpiDtlCd',  sortable: false, align:'center', width: "80px"},
                {text: '세부성과지표명',  value: 'kpiDtlNm',  sortable: false, align:'center', width: "80px"},
                {text: '성치율',  value: 'achrt',  sortable: false, align:'center', width: "80px"},
                {text: '결과',           value: 'f_err',  sortable: false, align:'center', width: "80px"},
            ],
            kpi2Items:[], kpi2ItemFiled:[], kpi2Info:[], kip2S:[],

            kpi3Head:[
                {text: '전송예약시간',   value: 's_restime',  sortable: false, align:'center', width: "80px"},
                {text: '전송일시',       value: 'trsDttm',  sortable: false, align:'center', width: "80px"},
                {text: '성과지표분야코드',  value: 'kpiFldCd',  sortable: false, align:'center', width: "80px"},
                {text: '세부성과지표코드',  value: 'kpiDtlCd',  sortable: false, align:'center', width: "80px"},
                {text: '세부성과지표명',  value: 'kpiDtlNm',  sortable: false, align:'center', width: "80px"},
                {text: '측정수치',       value: 'msmtVl',  sortable: false, align:'center', width: "80px"},
                {text: '단위',           value: 'unt',  sortable: false, align:'center', width: "80px"},
                {text: '결과',           value: 'f_err',  sortable: false, align:'center', width: "80px"},
            ],
            kpi3Items:[], kpi3ItemFiled:[], kpi3Info:[], kip3S:[],
            kpiResTime:[], ResTime: "",  kpiPopTitle:"",
            kpi1wdata:[],
        }
    },
    computed: {
        kpi1title() {
            return `${this.setCom.n_com} -- KPI1 자료 생성`
        },
        cleandarYM() {
            return `${this.ym.y}년 ${String(this.ym.m + 1).padStart(2, '0')}월`;
        },
        kpic_com() {
            const idx = this.workSite.findIndex(obj => obj.c_com == this.form.c_com);
            if (idx >= 0) {
                return this.workSite[idx].c_com;
            }
        },
        kpiCom() {
            const idx = this.workSite.findIndex(obj => obj.c_com == this.form.c_com);
            if (idx >= 0) {
                return this.workSite[idx].n_kpiconm;
            }
        },
        kpiKey() {
            const idx = this.workSite.findIndex(obj => obj.c_com == this.form.c_com);
            if (idx >= 0) {
                return this.workSite[idx].i_kpikey;
            }
        },
        getDate() {
            return this.masterinfo.s_day;
        },
    },
    watch: {
        ym: {
            deep: true,
            handler(newItems, oldItems) {this.form.s_ym = this.yyyymm(); },            
        },
        systmOprYn: {
            handler(newItems, oldItems) {                
            }
        },
        

    },
    methods: {
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 200 + 35;
        },
        async init() {
            const now = new Date(Date.now());
            this.ym.y = now.getFullYear();
            this.ym.m = now.getMonth();
            this.workSite = await this.$axios.post(`/api/kpi/getWorksite`);
        },
        yyyymm() {
            return `${this.ym.y}${String(this.ym.m + 1).padStart(2, '0')}`;
        },
        prevMon() {
            if (this.ym.m == 0) {
                this.ym.m = 11;
                this.ym.y = this.ym.y - 1;
            } else {
                this.ym.m = this.ym.m  - 1;
            }            
        },
        nextMon(){
            if (this.ym.m == 11) {
                this.ym.m = 0;
                this.ym.y = this.ym.y + 1;
            } else {
                this.ym.m = this.ym.m  + 1;
            }
        },
        getErrName(err) {
            return err == 'N' ? '성공' : err == 'Y'? '실패' : '대기';

        },
        row_classes(item) {
            if (item.f_week == "1" || item.f_week == "7") {
                return "orange";
            } 
        },
        async view() {   
            this.setCom.c_com = this.kpic_com;
            this.setCom.n_com = this.kpiCom;
            this.setCom.i_kpikey = this.kpiKey;            
            this.masterinfo = []; this.selectedM = []; //this.itemLists = []; this.itemListsselect = [] ,this.itemInfo = [];   
            
            this.masters = await this.$axios.post(`/api/kpi/getResKpi`, this.form);
            this.kpiResTime = await this.$axios.post(`/api/kpi/getKPITime`, this.form); 
            this.kpi1Items = await this.$axios.post(`/api/kpi/getKPI1List`, this.form);
            this.kpi2Items = await this.$axios.post(`/api/kpi/getKPI2List`, this.form);
            this.kpi3Items = await this.$axios.post(`/api/kpi/getKPI3List`, this.form);

        },
        async rowSelectMaster(item, row) {
            if(this.masterinfo.s_day == item.s_day) return;
            
            this.masterinfo = item;
            if (row) { row.select(true) } else { this.selectedM = [item] }; 

            this.kpi1ItemFiled = this.kpi1Items.filter((i) => i.ocrDttm === item.s_date);
            this.kpi2ItemFiled = this.kpi2Items.filter((i) => i.ocrDttm === item.s_date);
            this.kpi3ItemFiled = this.kpi3Items.filter((i) => i.ocrDttm === item.s_date);

            this.kpi1Info = [];
            this.kpi2Info = [];
            this.kpi3Info = [];
        },
        async rowSelectKpi1(item, row) {
            if(this.kpi1Info.t_no == item.t_no) return;            
            this.kpi1Info = item;
            this.kpi2Info = [];
            this.kpi3Info = [];
            if (row) { row.select(true) } else { this.kip1S = [item] }; 
        },
        async rowSelectKpi2(item, row) {
            if(this.kpi2Info.t_no == item.t_no) return;            
            this.kpi2Info = item;
            this.kpi1Info = [];
            this.kpi3Info = [];
            if (row) { row.select(true) } else { this.kip2S = [item] }; 
        },
        async rowSelectKpi3(item, row) {
            if(this.kpi3Info.t_no == item.t_no) return;            
            this.kpi3Info = item;
            this.kpi1Info = [];
            this.kpi2Info = [];
            if (row) { row.select(true) } else { this.kip3S = [item] }; 
        },
        async addKpi(kpi) {

            if (!this.kpiKey) {
                this.$toast.warning(`인증키값이 없습니다.`);
                return;
            }
            this.setCom.ocrDttm = this.masterinfo.s_date;
            this.setCom.s_day   = this.masterinfo.s_day;
            this.kpiindex = kpi == "kpi3" ? 2 : kpi == "kpi2" ? 1 : 0;
            this.ResTime = kpi == "kpi3" ? this.kpiResTime.KPI3 : kpi == "kpi2" ? this.kpiResTime.KPI2 : this.kpiResTime.KPI1;             
            this.$refs.dialog_kpi.open();

        },
        async delKpi(kpi) {
            if (!this.kpiKey) {
                this.$toast.warning(`인증키값이 없습니다.`);
                return;
            }
            const kpidata = kpi == "kpi3" ? this.kpi3Info  : kpi == "kpi2" ? this.kpi2Info : this.kpi1Info;
            if(kpidata.length == 0) {
                this.$toast.warning(`선택 자료가 없습니다.`);
                return;
            }
            // console.log(kpidata)
            // return;
            kpidata.kpilev = kpi;            
            const rv = await this.$axios.post(`/api/kpi/delKPIJob`, kpidata); 
            if (rv) {
                console.log(kpi, kpidata)
                if (kpi == "kpi3") {
                    const idxf = this.kpi3ItemFiled.indexOf(kpidata);
                    if (idxf >= 0) this.kpi3ItemFiled.splice(idxf, 1);
                    const idx = this.kpi3Items.indexOf(kpidata);
                    if (idx >= 0) this.kpi3Items.splice(idx, 1);
                } else if (kpi == "kpi2") {
                    const idxf = this.kpi2ItemFiled.indexOf(kpidata);
                    if (idxf >= 0) this.kpi2ItemFiled.splice(idxf, 1);
                    const idx = this.kpi2Items.indexOf(kpidata);
                    if (idx >= 0) this.kpi2Items.splice(idx, 1);
                } else {
                    const idxf = this.kpi1ItemFiled.indexOf(kpidata);
                    if (idxf >= 0) this.kpi1ItemFiled.splice(idxf, 1);
                    const idx = this.kpi1Items.indexOf(kpidata);
                    if (idx >= 0) this.kpi1Items.splice(idx, 1);                    
                }
                this.modKPIData(kpi, kpidata, 'd');
            }
        },
        async kpi_close() {
            // this.$refs.dialog_kpi.close();            
        },
        async appKpidb(kpi) {
            if (!this.kpiKey) {
                this.$toast.warning(`인증키값이 없습니다.`);
                return;
            }

            // this.$refs.dialog_wizard.open();
            // return;
            const year = this.form.s_ym.slice(0, 4);  // 앞 4자리: 연도
            const month = this.form.s_ym.slice(4);   // 나머지 2자리: 월
            this.kpi1wdata = generateRandomTimes(`${year}-${month}`)
            this.kpi1wdata = this.kpi1wdata.filter(item => {
                // 날짜 문자열 분리
                let year = item.date.slice(0, 4);   // 연도: 앞 4자리
                let month = item.date.slice(4, 6); // 월: 5~6번째 자리
                let day = item.date.slice(6);      // 일: 마지막 2자리

                // Date 객체 생성 (month는 0부터 시작하므로 -1)
                let date = new Date(year, month - 1, day);

                // 요일 확인
                let dayOfWeek = date.getDay();
                return dayOfWeek !== 0 && dayOfWeek !== 6; // 0: 일요일, 6: 토요일
            });
            if (this.kpi1wdata.length) {
                this.kpi1wdata.forEach(item => {
                    item.c_com = this.setCom.c_com;
                    item.i_kpikey = this.setCom.i_kpikey;
                    item.n_com = this.setCom.n_com;
                    item.yn = 'Y';
                })
            }
            this.$refs.dialog_wizard.open();
            return;
        },
        modKPIData(kpi, kpidata, job) {
            
            if (job == "a") {
                this.$refs.dialog_kpi.close();
                if (kpi == "kpi3") {
                    this.kpi3Items.push(kpidata);
                    this.kpi3ItemFiled.push(kpidata);
                } else if (kpi == "kpi2") {
                    this.kpi2Items.push(kpidata);
                    this.kpi2ItemFiled.push(kpidata);
                } else {
                    this.kpi1Items.push(kpidata);
                    this.kpi1ItemFiled.push(kpidata);
                }                
            }

            const cnt = kpi == "kpi3" ? this.kpi3ItemFiled.length  : kpi == "kpi2" ? this.kpi2ItemFiled.length : this.kpi1ItemFiled.length;
            if (kpi == "kpi3") {
                this.masterinfo.s_k3time = cnt == 0 ? '': kpidata.s_restime;
            } else if (kpi == "kpi2") {
                this.masterinfo.s_k2time = cnt == 0 ? '': kpidata.s_restime;
            } else {
                this.masterinfo.s_k1time = cnt == 0 ? '': kpidata.s_restime;
            }

            
        }
    },
   
}
</script>

<style>

</style>