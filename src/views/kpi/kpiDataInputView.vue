<template>
    <v-container fluid> 
        <v-toolbar height="40px" background-color="primary" dark>
            <v-toolbar-title>KPI 핵심성과지표 DATA 관리</v-toolbar-title>
            
            <v-spacer/>
            사업장 : <v-select hide-details dense v-model="form.c_com" :items="workSite" item-text="n_com" item-value="c_com" style="width:20px; max-width:100px;"></v-select>
            <tooltip-btn label="조회" @click="view"><v-icon>mdi-magnify</v-icon></tooltip-btn> 
            <tooltip-btn label="추가" @click="add"><v-icon>mdi-plus</v-icon></tooltip-btn>
            <tooltip-btn label="삭제" @click="del"><v-icon>mdi-minus</v-icon></tooltip-btn>
            <tooltip-btn label="저장" @click="save"><v-icon>mdi-content-save-outline</v-icon></tooltip-btn>
        </v-toolbar>
        <v-row>
        <v-col col="12" sm="9" md="9">
            <v-data-table ref="kpi1" :headers="kpiHead"  :items="kpiData" 
                    item-key="t_no" single-select 
                    hide-default-footer :items-per-page="-1" 
                    class="elevation-1 text-no-wrap" :item-class= "row_classes"
                    :height="iframeHeight" > 
                <template v-slot:item="{ item }">
                    <!-- <tr :style="{ backgroundColor: getCellBackgroundColor(item) }"> -->
                    <tr  :class="{ 'row_select': item === kpiDataS }" class="center-align" @click="selectItem(item)">                    
                        <td :style="{backgroundColor: getCellStyle(item, 'kpilevel')}">
                            <v-text-field @input="onChange(item)" v-model="item.kpilevel" :readonly="item.f_editold == 0" dense class="my-text-field  no-padding"/>
                        </td>
                        
                        <td :style="{backgroundColor: '#ffdda0'}"><v-text-field @input="onChange(item)" v-model="item.ocrDttm" dense  class="my-text-field no-padding"/></td>
                        <td :style="{backgroundColor: '#ffdda0'}"><v-text-field @input="onChange(item)" v-model="item.f_tst" dense  class="my-text-field no-padding"/></td>
                        <td :style="{backgroundColor: '#ffdda0'}"><v-text-field @input="onChange(item)" v-model="item.s_restime" dense  class="my-text-field no-padding"/></td>
                        <td :style="{backgroundColor: getCellStyle(item, 'systmOprYn')}"><v-text-field @input="onChange(item)" v-model="item.systmOprYn" dense  class="my-text-field no-padding"/></td>
                        <td :style="{backgroundColor: getCellStyle(item, 'kpiFldCd')}"><v-text-field @input="onChange(item)" v-model="item.kpiFldCd" dense  class="my-text-field no-padding"/></td>                    
                        <td :style="{backgroundColor: getCellStyle(item, 'kpiDtlCd')}"><v-text-field @input="onChange(item)" v-model="item.kpiDtlCd" dense  class="my-text-field no-padding"/></td>
                        <td :style="{backgroundColor: getCellStyle(item, 'kpiDtlNm')}"><v-text-field @input="onChange(item)" v-model="item.kpiDtlNm" dense  class="my-text-field no-padding"/></td>
                        <td :style="{backgroundColor: getCellStyle(item, 'achrt')}"><v-text-field @input="onChange(item)" v-model="item.achrt" dense  class="my-text-field no-padding"/></td>
                        <td :style="{backgroundColor: getCellStyle(item, 'unt')}"><v-text-field @input="onChange(item)" v-model="item.unt" dense  class="my-text-field no-padding"/></td>                    
                        <td :style="{backgroundColor: getCellStyle(item, 'msmtVl')}"><v-text-field @input="onChange(item)" v-model="item.msmtVl" dense  class="my-text-field no-padding"/></td>   
                        <td> {{  getStatue(item) }}</td>                 
                    </tr>
                </template> 
            </v-data-table>
        </v-col>
        <v-col col="12" sm="3" md="3">
            <v-data-table ref="kpiLevel" :headers="kpiLevelHead"  :items="kpiLevelLists" 
                    item-key="lev" single-select  v-model="kpiLevelInfos"
                    hide-default-footer :items-per-page="-1" 
                    class="elevation-1 text-no-wrap" :item-class= "row_classes" @click:row="rowSelectLevel"  @dblclick:row="SetLevel" 
                    height="130" > 
            </v-data-table>

            <v-data-table ref="kpiFldDt" :headers="KpiFldDtHead"  :items="KpiFldDtLists" 
                    item-key="c_gccode" single-select v-model="kpiFldtDtInfos"
                    hide-default-footer :items-per-page="-1" 
                    class="elevation-1 text-no-wrap" :item-class= "row_classes"  @click:row="rowSelectFldDt" @dblclick:row="SetFildDt" 
                    :height="iframeHeight - 130" > 
            </v-data-table>
        </v-col>
        </v-row>
    </v-container>
</template>

<script>
import TooltipBtn from '../../components/etc/TooltipBtn.vue';
import InputDate2 from '../../components/InputForms/InputDate2.vue';
export default {
    components: { TooltipBtn, InputDate2 },
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
            form : {c_com:"", s_ym:"", f_tst:"Y"},  workSite:[],
            setCom :{c_com:"", n_com:"", i_kpikey:"", s_day:"", ocrDttm:""},
            kpiHead:[
                {text: 'KPI Level',   value: 'kpilevel',  sortable: false, align:'center', width: "100px"},
                {text: '날자',   value: 'ocrDttm',  sortable: false, align:'center', width: "80px"},
                {text: 'TEST',   value: 'f_tst',  sortable: false, align:'center', width: "20px"},
                {text: '예약시간',   value: 's_restime',  sortable: false, align:'center', width: "50px"},
                {text: '가동',   value: 'systmOprYn',  sortable: false, align:'center', width: "40px"},
                {text: '성과코드',   value: 'kpiFldCd',  sortable: false, align:'center', width: "50px"},
                {text: '지표코드',   value: 'kpiDtlCd',  sortable: false, align:'center', width: "50px"},
                {text: '성과지표',   value: 'kpiDtlNm',  sortable: false, align:'center', width: "200px"},                                
                {text: '성치율',   value: 'achrt',  sortable: false, align:'center', width: "50px"},
                {text: '단위',   value: 'unt',  sortable: false, align:'center', width: "50px"},
                {text: '수치',   value: 'msmtVl',  sortable: false, align:'center', width: "50px"},
                {text: '상태',   value: 'f_edit',  sortable: false, align:'center', width: "50px"},

                
            ],
            kpiData:[], kpiDataS:[],
            kpiLevlel:['KPILEVEL1', 'KPILEVEL2', 'KPILEVEL3'],
            kpiFldCds:[{CD:"P", NM:"생산"}, {CD:"C", NM:"원가"}, {CD:"Q", NM:"품질"}, {CD:"D", NM:"납기"}],
            kpiDtlCds:[], kpiDtlCd:[],

            KpiFldDtHead:[
                {text: '성과',      value: 'kpiFldNm',  sortable: false, align:'center', width: "80px"},
                //{text: '지표코드',  value: 'kpiDtlCd',  sortable: false, align:'center', width: "50px"},
                {text: '성과지표',  value: 'kpiDtlNm',  sortable: false, align:'left', width: "150px"},
                {text: '단위',     value: 'unt',  sortable: false, align:'center', width: "50px"},
            ], KpiFldDtLists:[],  kpiFldtDtInfo:[], kpiFldtDtInfos:[],
            kpiLevelHead:[
                {text: 'LEVEL',  value: 'lev',  sortable: false, align:'center', width: "50px"},
                {text: '시간',   value: 't_time',  sortable: false, align:'center', width: "50px"},
            ], kpiLevelLists: [], kpiLevelInfo:[], kpiLevelInfos:[],
        }
    },
    computed: {
       
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
        
    },
    methods: {
        adjustIframeHeight() {
        // 브라우저 창의 높이를 iframe의 높이로 설정
            const windowHeight = window.innerHeight;
            this.iframeHeight = windowHeight - 200;
        },
    
        row_classes(item) {
            if (item.f_edit == "2") {
                return "orange";
            } 
        },
        getCellBackgroundColor(item) {
            // 특정 행의 특정 셀 배경색을 동적으로 반환하는 메서드
            if (item.kpilevel === 'KPILEVEL1') {
                return '#fce4d6'; // 원하는 배경색으로 변경하세요.
            } else if (item.kpilevel === 'KPILEVEL2') {
                return '#fce4c0'; // 다른 배경색으로 변경하세요.
            } else if (item.kpilevel === 'KPILEVEL3') {
                return '#99ff00'; // 다른 배경색으로 변경하세요.
            }
            return 'transparent'; // 기본 배경색
        },
        getCellStyle(item, cell) {
            // 특정 행의 특정 셀 배경색을 동적으로 반환하는 메서드
            if (item.kpilevel === 'KPILEVEL1' && (cell == 'kpilevel' || cell == 'systmOprYn') ) {
                return '#fce4d6'; // 원하는 배경색으로 변경하세요.
            } else if (item.kpilevel === 'KPILEVEL2' && (cell == 'kpilevel' || cell == 'kpiFldCd' || cell == 'kpiDtlCd' || cell == 'kpiDtlNm' || cell == 'achrt') ) {
                return '#b4c6e7'; // 다른 배경색으로 변경하세요.
            } else if (item.kpilevel === 'KPILEVEL3' && (cell == 'kpilevel' || cell == 'kpiFldCd' || cell == 'kpiDtlCd' || cell == 'kpiDtlNm' || cell == 'msmtVl' || cell == 'unt') ) {
                return '#99ff00'; // 다른 배경색으로 변경하세요.
            }
            return 'transparent'; // 기본 배경색
        },
        getStatue(item) {
            let rv = ""
            if(item.f_edit == '2') { rv = "삭제"}
            else if (item.f_editold == '1') { rv = "추가"}
            else if(item.f_edit == '1') { rv = "수정"}
            else rv = '';
            return rv;
        },
        async init() {
            this.workSite = await this.$axios.post(`/api/kpi/getWorksite`);
            this.kpiDtlCds = await this.$axios.post(`/api/kpi/getKpiFild`); 
            this.KpiFldDtLists = await this.$axios.post(`/api/kpi/kpiFldDtlist`); 
            

            this.kpiDtlCd = this.kpiDtlCds.filter(function(item) { return item.c_gcode == `KPIP`; });
        },
        async view() {
            if (!this.kpiKey) {
                this.$toast.warning(`인증키값이 없습니다.`);
                return;
            }

            this.setCom.c_com = this.kpic_com;
            this.setCom.n_com = this.kpiCom;
            this.setCom.i_kpikey = this.kpiKey; 
            
            this.kpiLevelLists = await this.$axios.post(`/api/kpi/kpiLevellist`, this.setCom);     
            this.kpiData = await this.$axios.post(`/api/kpi/kpiJoblist`, this.setCom);
        },
        async add() {
            if (!this.kpiKey) {
                this.$toast.warning(`인증키값이 없습니다.`);
                return;
            }            
            const obj = {}
                obj.kpilevel = this.kpiLevelInfo.lev;
                obj.t_no = ""
                obj.c_com = this.setCom.c_com;
                obj.kpiCertKey = this.setCom.i_kpikey;
                obj.ocrDttm = ""
                obj.s_restime = this.kpiLevelInfo.t_time;
                obj.systmOprYn = this.kpiLevelInfo.lev == "KPILEVEL1" ? "Y":"";
                obj.kpiFldCd = this.kpiLevelInfo.lev == "KPILEVEL1" ? this.kpiFldtDtInfo.kpiFldCd : "";
                obj.kpiDtlCd = this.kpiLevelInfo.lev == "KPILEVEL1" ? this.kpiFldtDtInfo.kpiDtlCd : "";
                obj.kpiDtlNm = this.kpiLevelInfo.lev == "KPILEVEL1" ? this.kpiFldtDtInfo.kpiDtlNm : "";
                obj.achrt = ""
                obj.msmtVl = ""
                obj.unt = this.kpiLevelInfo.lev == "KPILEVEL3" ? this.kpiFldtDtInfo.unt : "";
                obj.trsDttm = ""
                obj.f_tst = "Y"
                obj.t_req = ""
                obj.t_res = ""
                obj.f_err = "-"
                obj.f_edit    = '1'; 
                obj.f_editold = '1';
            const idx = this.kpiData.push(obj) ;
        },
        async del() {
            if (this.kpiDataS.f_edit == 'undefined') return;
            const idx = this.kpiData.indexOf(this.kpiDataS)
            if ( idx >= 0 ) {
                if (this.kpiDataS.f_editold == '1') {
                    this.kpiData.splice(idx, 1)
                } else {
                    this.kpiData[idx].f_edit = this.kpiData[idx].f_edit == '2' ? '1' : '2';
                }
            }
        },
        async save() {
            const savedata = this.kpiData.filter((i) => i.f_edit !== '0');
            // 입력항목 체크 KPI level, 날짜
            savedata.forEach((row) => {

            })
            const rv = await this.$axios.post(`/api/kpi/iukpiJoblist`, savedata);            
            if (rv) {
                savedata.forEach((row, index) => {
                    const idx = this.kpiData.indexOf(row);
                    if (idx >= 0) {
                        if(row.f_edit == '2') {
                            this.kpiData.splice(idx, 1)
                        } else {
                            this.kpiData[idx].f_edit = '0'
                            this.kpiData[idx].f_editold= '0'
                        }
                    }
                })
            }
        },

        onChange(item) {
            item.f_edit = '1';
        },

        onChangeFldCd(data) {            
            this.kpiDtlCd = this.kpiDtlCds.filter(function(item) { return item.c_gcode == `KPI${data}`; });
        },
        async selectItem(item) {
            if (this.kpiDataS == item) return;
            this.kpiDataS = item;            
        },
        rowSelectLevel :function (item, row) {    
            row.select(true);            
            this.kpiLevelInfo = item;            
        },
        rowSelectFldDt :function (item, row) {    
            row.select(true);
            this.kpiFldtDtInfo = item;
            // this.item = item;            
        },
        async SetLevel(event, { item }) {
            if(!this.kpiDataS.c_com) return
            this.kpiDataS.kpilevel = item.lev;
            this.kpiDataS.systmOprYn = "Y";
            this.kpiDataS.s_restime = item.t_time;
        },
        async SetFildDt(event, { item }) {
            if(!this.kpiDataS.c_com) return
            if(this.kpiDataS.kpilevel == "KPILEVEL1") {
                return
            } else if (this.kpiDataS.kpilevel == "KPILEVEL2") {
                this.kpiDataS.kpiFldCd = item.kpiFldCd;
                this.kpiDataS.kpiDtlCd = item.kpiDtlCd;
                this.kpiDataS.kpiDtlNm  = item.kpiDtlNm;                
                this.kpiDataS.achrt     = "";
                this.kpiDataS.unt       = "";
                this.kpiDataS.msmtVl    = "";                
            } else if (this.kpiDataS.kpilevel == "KPILEVEL3") {
                this.kpiDataS.kpiFldCd = item.kpiFldCd;
                this.kpiDataS.kpiDtlCd = item.kpiDtlCd;
                this.kpiDataS.kpiDtlNm  = item.kpiDtlNm;
                this.kpiDataS.achrt     = "";
                this.kpiDataS.unt       = item.unt;
                this.kpiDataS.msmtVl    = "";                
            }
            this.kpiDataS.systmOprYn = "";
            this.kpiDataS.f_edit    = "1";
            
            
        }
    },

}
</script>

<style>

</style>