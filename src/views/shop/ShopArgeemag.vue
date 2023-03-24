<template>
    <v-container fluid>
    <v-toolbar>
        <v-toolbar-title>협약서관리</v-toolbar-title>
        <v-spacer/>
        <v-text-field label="업체명 : " v-model="chkf_serarch" hide-details  single-lin  />
        
        <v-radio-group inline  label="협약서 :" v-model="chkf_arfe" row hide-details class="small-radio no-space"   >
            <v-radio label="전체" value="%" />
            <v-radio label="완료" value="Y" />
            <v-radio label="미완료" value="N" />
        </v-radio-group>
        <v-btn color="primary"  @click="fetchData">조회</v-btn>
    </v-toolbar>

    <v-data-table :headers="headers"  :items="itemArgee" :items-per-page="20"  :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
            
            class="elevation-1 mytable mytableTd">
        <template v-slot:item="{ item }">            
            <tr >
                <td @dblclick="showRowInfo(item)"><u>{{ item.n_company }}</u></td>
                <td v-if="item.rnum>=1" align=center :class="{greencol: item.t1}"> {{datachk(item.t1)}}</td>
                <td v-if="item.rnum>=2" align=center :class="{greencol: item.t2}"> {{datachk(item.t2)}}</td>
                <td v-if="item.rnum>=3" align=center :class="{greencol: item.t3}"> {{datachk(item.t3)}}</td>
                <td v-if="item.rnum>=4" align=center :class="{greencol: item.t4}"> {{datachk(item.t4)}}</td>
                <td v-if="item.rnum>=5" align=center :class="{greencol: item.t5}"> {{datachk(item.t5)}}</td>
                <td v-if="item.rnum>=6" align=center :class="{greencol: item.t6}"> {{datachk(item.t6)}}</td>
                <td v-if="item.rnum>=7" align=center :class="{greencol: item.t7}"> {{datachk(item.t7)}}</td>
                <td v-if="item.rnum>=8" align=center :class="{greencol: item.t8}"> {{datachk(item.t8)}}</td>
                <td v-if="item.rnum>=9" align=center :class="{greencol: item.t9}"> {{datachk(item.t9)}}</td>
                <td v-if="item.rnum>=10" align=center :class="{greencol: item.t10}"> {{datachk(item.t10)}}</td>
                <td v-if="item.rnum>=11" align=center :class="{greencol: item.t11}"> {{datachk(item.t11)}}</td>
                <td v-if="item.rnum>=12" align=center :class="{greencol: item.t12}"> {{datachk(item.t12)}}</td>
                <td v-if="item.rnum>=13" align=center :class="{greencol: item.t13}"> {{datachk(item.t13)}}</td>
                <td v-if="item.rnum>=14" align=center :class="{greencol: item.t14}"> {{datachk(item.t14)}}</td>
                <td v-if="item.rnum>=15" align=center :class="{greencol: item.t15}"> {{datachk(item.t15)}}</td>
                <td v-if="item.rnum>=16" align=center :class="{greencol: item.t16}"> {{datachk(item.t16)}}</td>
                <td v-if="item.rnum>=17" align=center :class="{greencol: item.t17}"> {{datachk(item.t17)}}</td>
                <td v-if="item.rnum>=18" align=center :class="{greencol: item.t18}"> {{datachk(item.t18)}}</td>
                <td v-if="item.rnum>=19" align=center :class="{greencol: item.t19}"> {{datachk(item.t19)}}</td>
                <td v-if="item.rnum>=20" align=center :class="{greencol: item.t20}"> {{datachk(item.t20)}}</td>
                <td @dblclick="f_argeechk(item)" align=center  :class="{greencol: item.f_argeechk}"> <u>{{ argeechk(item.f_argeechk) }}</u></td>
            </tr>
        </template>
    </v-data-table>
    <ez-dialog label="협약서 서류 확인" ref="dialog" max-width="800"  color="primary" persistent>
        <shop-argeemag-01-form @process="saveDocProcess" @mailSend="mailSend" :fileLists="fileItem" :companyName="this.n_company">

        </shop-argeemag-01-form>
    </ez-dialog>

    <tiptab-mail label="메일발송" 
        :body_content= "this.form.body" 
        :mail_title = "this.form.title"
        :itemInput = "this.fileItem"
        ref="dialog2" max-width="900" max-height="1300"  persistent @onSend="sendMail">
    </tiptab-mail>

    <ez-dialog-2 label="처리중" ref="ez_wait" max-width="200" persistent color="primary" ></ez-dialog-2>
    
    </v-container>

</template>

<script>
import { deepCopy, extractNumber } from "../../../util/lib";
import { mapActions, mapGetters, mapMutations } from "vuex";
import EzDialog from '../../components/etc/EzDialog.vue';
import ShopArgeemag01Form from './ShopArgeemag01Form.vue';
import TiptabMail from '../../components/tiptab/TiptabMail.vue';
import EzDialog2 from '../../components/etc/EzDialog2.vue';
export default {
  components: { EzDialog, ShopArgeemag01Form, TiptabMail, EzDialog2,  },
    name :"ShopArgeeMag",
	title : "사업협약서관리",
    data() {
        return {            
            headers: [],
            itemArgee: [],
            chkf_arfe : "%",
            chkf_serarch: "",
            rnum: null,   
            fileItem:[],
            n_company: null,
            form: {
                title: "",
                to_email: "",
                cc_email: "",
                body: "",
            },           
        }
    },
    created() {
        this.rnum = 1;
        this.init() ;
    },
    mounted() {
        window.addEventListener('beforeunload', this.leave)
    },
    
    beforeUnmount() {
        window.removeEventListener('beforeunload', this.leave)
    },
    methods: {
        ...mapActions("shop", ["shopEmailSend"]),

        leave(event) {
		    event.preventDefault();
		    event.returnValue = '';
	    },
        datachk(data) {
            let val = "";
            if (data) { 
                val = "완료"
            } else {
                val = "미완료"
            }
            return  val;
        },
        argeechk(data) {
            return data=="Y" ? "확인" : "미확인";
        },
        async init() {
            this.rnum = 1;
            this.fetchData();
            
        },
        async fetchData() {            
            const head = {};
            this.headers.splice(0);
            head.text = "업체명";
            head.value = `n_company`;                            
            head.sortable = false;
            head.align = 'center';
            this.headers.push( { ...head });
            this.itemArgee = await this.$axios.get(`/api/shopinfo/getShopArgeeMag?i_shop=23-001&f_serarch=${this.chkf_serarch}&chkf_arfe=${this.chkf_arfe}`);
            
            if (this.itemArgee) {
                this.rnum = this.itemArgee[0].rnum;              
                for(let i=0; i<Object.keys(this.itemArgee[0]).length; i++){
                    let name = Object.keys(this.itemArgee[0])[i];
                    let value = this.itemArgee[0][name];                    
                    
                    if(name[0] =='h') {
                        if (this.rnum >= extractNumber(name)) {
                            head.text = value;                            
                            head.value = 't' + extractNumber(name);
                            head.sortable = false;
                            head.align = 'center';
                            this.headers.push( { ...head });
                        }
                    }
                }
                head.text = "확인";                            
                head.value = 'f_argeechk';
                head.sortable = false;
                head.align = 'center';
                this.headers.push( { ...head });
            }
            //  this.$refs.ez_wait.close();
        },
        async f_argeechk(item) {
            const res = await this.$ezNotify.confirm("처리 하시겠습니까  ?", "협약서");
            if (res ) {
                if (item.f_argeechk == "Y") {
                    item.f_argeechk  = 'N' ;
                } else {
                    item.f_argeechk  = 'Y' ;
                    const data = await this.$axios.patch(`/api/shopinfo/getShopInputMag?i_shop=${item.i_shop}&i_no=${item.i_no}&f_argeechk=${item.f_argeechk}`);
                }           
            }
        },
        async showRowInfo(item) {
            this.n_company = item.n_company;
            this.fileItem = deepCopy(item);               
            this.$refs.dialog.open();
        },
        async saveDocProcess(item) {
            for (let ob in item) {
                if(item[ob].f_edit) {
                    const data = this.$axios.patch(`/api/shopinfo/ShopInputMag2Save?i_shop=${item[ob].i_shop}&i_no=${item[ob].i_no}&i_ser=${item[ob].i_ser}&f_noact=${item[ob].f_noact}`);
                }
            }
        },
        async mailSend(item) {
            if (item) {                
                // const res = await this.$ezNotify.confirm("서류처리 내역 메일 발송 하시 겠습니까 ?.", "메일발송");
                this.form.title = "스마트공방 협약서 서류 확인 안내";
                let body = "<p>상기 제목 관련 하여 아래와 같이 첨부 서류 확인 결과 전달 드립니다.</p><p>";
                body = body + "공방 협약서 서류</p>"
                item.forEach((data) => {
                    let n_status = data.f_noact=='Y' ? "접수" : data.f_noact=='N' ? "반려" : data.f_noact=='I' ? '검토' : data.f_noact=='R' ? '검토' : '미등록';
                    body = body + `<p>${data.f_noact=='Y'?'':'<span style="color:red"'}>${data.n_file} : 서류${n_status}${data.f_noact=='Y'?'':'</span>'}</p>`;		        
                });
                body = body + `<p>반려된 첨부서류에 대해서 재 등록 부탁 드립니다.</p>`;
                body = body + `<p></p>감사 합니다.`;
                
                this.form.body = body;
                
                this.$refs.dialog2.open();
                
                // if (res) {
                //     const data = await this.$axios.get(`/api/shopinfo/getShopDocChkMail?i_shop=${item[0].i_shop}&i_no=${item[0].i_no}&f_gubun=${item[0].f_gubun}`);
                //     if(data == "ok") {
                //         await this.$ezNotify.alert("서류처리 내역 메일 발송 하였습니다..", "");
                //     }
                // }
            }
        },
        async getEmail(gubun) {
            let url = "";
            if (gubun == 'U') {
                url = `/api/shopinfo/shopgetEmail?i_userid=${this.itemInput.i_userid}&gubun=${gubun}`;
            } else if (gubun = 'S') {
                url = `/api/shopinfo/shopgetEmail?i_shop=${this.itemInput.i_shop}&i_no=${this.itemInput.i_no}&gubun=${gubun}`;
            } else if (gubun = 'M') {
                url = `/api/shopinfo/shopgetEmail?&gubun=TOKEN`;
            }            
            const data = await this.$axios.get(url);            
            if( data ) {                
                this.form.to_email = data[0].to_email;
            }
            // 메일 참조자  (사용자 로그인)
            const data2 = await this.$axios.get(`/api/shopinfo/shopgetEmail?&gubun=TOKEN`);            
            if( data2 ) {                
                this.form.cc_email = data2[0].to_email;
            }
        },
        async sendMail(title, tomail, ccmail, html) {
            // 메일 작성 내용 저장 및 메일 발송
            this.$refs.ez_wait.open();
            this.form.title = title;
            this.form.to_email = tomail;
            this.form.cc_email = ccmail;
            this.form.body = html;
            
            const data = await this.shopEmailSend(this.form);
            this.$refs.ez_wait.close();
            if (data == "ok") {
                this.$ezNotify.alert("정상적으로 메일 발송 하였습니다..... ", "성공");
                this.$refs.dialog2.close();
            }
            
        },

    },
    
}
</script>

<style>

</style>