<template>
    <v-card v-if="!this.$store.state.user.member"  width="100%" elevation="10">
        <login />
    </v-card>
    <v-card v-else>
        <v-toolbar>
            <v-toolbar-title>스마트공방 사업신청</v-toolbar-title>
            <v-spacer></v-spacer>
        </v-toolbar>  
        
            <v-card background-color="primary" dark>            
            <div v-text="memo" style="white-space:pre-line"></div>
            </v-card>
        
        <v-tabs v-model="tabs" background-color="primary" dark>
            <v-tab value="tbapage_1" style="flex: 1" >개인정보 동의</v-tab>
            <v-tab value="tbapage_2" style="flex: 1" :disabled="!this.$store.state.user.shopinfo || !this.$store.state.user.shopinfo.f_persioninfo=='1'">회사 정보</v-tab>
            <v-tab value="tbapage_3" style="flex: 1" :disabled="!this.istab2" >스마트공방 신청</v-tab>
            <v-tab value="tbapage_4" style="flex: 1" :disabled="!this.istab3" >회사 추가 정보</v-tab>
        </v-tabs>
        
        <v-card-text>
            <v-tabs-items v-model="tabs">                                 
                <v-tab-item><signed-p-01-form @save="save1" /></v-tab-item>                
                <v-tab-item><signed-p-02-form @save="save2" :item="this.$store.state.user.shopinfo"/></v-tab-item>
                <v-tab-item><signed-p-03-form @save="save3" :attfile="this.shioinfofiles" /></v-tab-item>
                <v-tab-item><signed-p-04-form @save="save4" :attfile="this.shopinfofileadds" /></v-tab-item>
            </v-tabs-items>            
        </v-card-text>
      
    </v-card>

</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import { deepCopy } from "../../../util/lib";
import Login from '../member/Login.vue'
import SignedP01Form from './SignedP01Form.vue'
import SignedP02Form from './SignedP02Form.vue'
import SignedP03Form from './SignedP03Form.vue'
import SignedP04Form from './SignedP04Form.vue'

export default {
  components: { Login, SignedP01Form, SignedP02Form, SignedP03Form, SignedP04Form },

	name :"ShopSigned",
	title : "스마트공방 신청",
    data() {
        return {            
            tabs: parseInt(this.$route.query.tabs) || 0 ,
            // items: ["개인정보 동의", "회사 정보", "스마트공방 신청", "회사 추가 정보"],  

            isLoading: false,
            items: [
                {id:'Sucess', name:'개인정보 동의', enable:'Y'},
                {id:'Cominfo', name:'회사 정보', enable:'Y'},
                {id:'Input', name:'스마트공방 신청', enable:'Y'},
                {id:'Addinfo', name:'회사 추가 정보', enable:'Y'},
            ],
            shioinfofiles: [],
            shopinfofileadds: [],          
            istab2: false,  
            istab3: false,
            istab4: false,
            filechk: { field: "f_gubun", value: "1"},
            memo : "",
        }
    },
    mounted() {        
        window.addEventListener('beforeunload', this.leave);
        if (this.$store.state.user.member ) {
            this.fetchData();
            if(this.$store.state.user.shopinfo.f_persioninfo) {
               this.tabs = 1;
            } else {
                this.tabs = 0;
            }
        }

    },
    beforeUnmount() {
        window.removeEventListener('beforeunload', this.leave)
    },
    methods: {
        ...mapActions("user", ["checkShopInfo", "updateShopInfo"]),        
        ...mapMutations("user", ["SET_SHOPINFO"]),
        ...mapGetters("user", ["isShopinfochk"]),

        leave(event) {
		    event.preventDefault();
		    event.returnValue = '';
	    },
        inputFileChk() {
            this.istab3 = true;
            if (this.shioinfofiles) {
                for(let ob in this.shioinfofiles) {                    
                    if (this.shioinfofiles[ob].f_yn == '1' && !this.shioinfofiles[ob].t_att) {
                        this.istab3 = false;
                        return;
                    }                    
            	}
            }
        },

        async fetchData() {       
            const data = await this.checkShopInfo();            
            this.shioinfofiles = await this.$axios.patch(`/api/shopinfo/attfiles?f_gubun=1`);
            this.shopinfofileadds = await this.$axios.patch(`/api/shopinfo/attfiles?f_gubun=2`);
            if (this.$store.state.user.shopinfo) { this.istab2 = await this.isShopinfochk(); }
            this.inputFileChk();
            this.memo = this.$store.state.user.shopinfo.t_remark;
        },        
        async save1(form) {
            if (!form.i_shop) {
                form.i_shop = this.$store.state.user.shopinfo.i_shop;
                form.i_userid = this.$store.state.user.shopinfo.i_userid;
            }           
            const data = await this.updateShopInfo(form);
            if ( data ) {                
                this.shioinfofiles = await this.$axios.patch(`/api/shopinfo/attfiles?f_gubun=1`);
                this.shopinfofileadds = await this.$axios.patch(`/api/shopinfo/attfiles?f_gubun=2`);
                await this.checkShopInfo();
                this.istab2 = await this.isShopinfochk()
                this.$toast.info(`개인정보 동의 하였습니다.`);                            
            }
        },
        async save2(form) {
            const data = await this.updateShopInfo(form);
            if ( data ) {
                await this.checkShopInfo(); 
                this.istab2 = await this.isShopinfochk()
                this.$toast.info(`회사 정보 저장 하였습니다.`);                   
            }
        },
        async save3(form) {
            await this.$axios.patch(`/api/shopinfo/attfiles/upload`, form);
            this.shioinfofiles = await this.$axios.patch(`/api/shopinfo/attfiles?f_gubun=1`);
            this.$toast.info(`스마트공방 신청 저장 하였습니다.`);  
            this.inputFileChk();
        },
        async save4(form) {
            await this.$axios.patch(`/api/shopinfo/attfiles/upload`, form);
            this.shopinfofileadds = await this.$axios.patch(`/api/shopinfo/attfiles?f_gubun=2`);
            this.$toast.info(`회사 추가 정보 저장 하였습니다.`);  
        },

    }
}
</script>

<style>
.v-data-table > .v-data-table__wrapper > table > tbody > tr > th, .v-data-table > .v-data-table__wrapper > table > thead > tr > th, .v-data-table > .v-data-table__wrapper > table > tfoot > tr > th 
{
    font-size: 0.7rem;    
    height: 35px;    
}
.v-data-table > .v-data-table__wrapper > table > tbody > tr > td, .v-data-table > .v-data-table__wrapper > table > thead > tr > td, .v-data-table > .v-data-table__wrapper > table > tfoot > tr > td {
  font-size: 0.35rem;
  height: 26px; 
}
table.nodoc {
  border-collapse: collapse;
  text-align: left;
  line-height: 1;
  border-top: 1px solid #ccc;
  border-left: 3px solid #369;
  margin : 20px 10px;
  font-size: 0.40rem;
}
table.nodoc td {
  font-weight: bold;
  vertical-align: top;
  color: white;
  background: #153d73; 
  border-right: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
}

.mytable table th {
    background-color: lightgoldenrodyellow;
    border-bottom: none !important;
 }
 .mytableTd table td {
    /* color: blue; */
    text-align: center;
    border-bottom: none !important;
 }
.my-underline {
    text-decoration-line: underline;
}
</style>