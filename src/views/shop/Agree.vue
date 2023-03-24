<template>
    <v-card v-if="!this.$store.state.user.member"  width="100%" elevation="10">
        <login />
    </v-card>
    <v-card v-else>
        <v-card v-if="!chk" class="d-flex justify-center align-center" :height="500">
            <p style="font-size:200%">
                서류 심사 중 입니다 ...
            </p>
        </v-card>
        <v-card v-else>
            <v-toolbar>
                <v-toolbar-title>스마트공방 협약신청</v-toolbar-title>
                <v-spacer></v-spacer>
            </v-toolbar>  
            <v-card background-color="primary" dark>
                <div v-text="memo" style="white-space:pre-line"></div>
            </v-card>
            <signed-p-03-form @save="save3" :attfile="this.shioinfofiles" />
        </v-card>
    </v-card>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from "vuex";
import SignedP03Form from './SignedP03Form.vue'
export default {
    components: { SignedP03Form },
    name :"ShopArgee",
	title : "협약신청",
    data() {
        return {   
            shioinfofiles: [],
            memo: "",
            chk: 0,
        }
    },
    created() {
        this.init();
        this.fetchData();
    },
    methods: {
        ...mapActions("user", ["checkShopInfo"]),    
        ...mapMutations("user", ["SET_SHOPINFO"]),        
        ...mapGetters("user", ["isShopinfochk"]),

        async init() {
            const data = await this.checkShopInfo(); 
            this.memo = this.$store.state.user.shopinfo.t_remark2;
            const chk = await this.$axios.get(`/api/shopinfo/getShopArgeeInChk?i_shop=${this.$store.state.user.shopinfo.i_shop}`);
            if (chk.cnt) this.chk = chk.cnt;
        },
        async fetchData() {
            this.shioinfofiles = await this.$axios.patch(`/api/shopinfo/attfiles?f_gubun=3`);   

        },
        async save3(form) {
            await this.$axios.patch(`/api/shopinfo/attfiles/upload`, form);
            this.shioinfofiles = await this.$axios.patch(`/api/shopinfo/attfiles?f_gubun=3`);
            this.$toast.info(`저장 하였습니다.`);              
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
</style=>