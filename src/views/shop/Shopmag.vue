<template>
    <v-container fluid>
    <v-card v-if="!this.$store.state.user.member" width="100%" elevation="10">
        <login />
    </v-card>
    <v-card v-else>
        <v-toolbar>
            <v-toolbar-title>사업관리</v-toolbar-title>
            <v-spacer></v-spacer>
            <tooltip-btn v-if="this.tabs==0 &&  this.$store.state.user.member.mb_level >=9" fab small label="사업추가" @click="addShop">
                <v-icon>mdi-plus</v-icon>
            </tooltip-btn>
            <tooltip-btn v-if="this.tabs>=1" fab small label="첨부 서류 추가" @click="addFile">
                <v-icon>mdi-arrow-up-bold-box-outline</v-icon>
            </tooltip-btn>
        </v-toolbar>
        
        <v-tabs v-model="tabs" background-color="primary" dark>
            <v-tab value="tbapage_1" style="flex: 1" >사업 내역</v-tab>
            <v-tab value="tbapage_2" style="flex: 1" >신청 서류</v-tab>            
            <v-tab value="tbapage_3" style="flex: 1" >추가 서류</v-tab>
            <v-tab value="tbapage_4" style="flex: 1" >협약서 서류</v-tab>
        </v-tabs>
        <v-card-text>
            <v-tabs-items v-model="tabs"> 
                <v-tab-item><shopmag-01-form @save="save2" :itemLists="this.itemShops" @edit="addShop" @select="selectRow"/></v-tab-item>                 
                <v-tab-item><shopmag-02-form :addLists="this.fileAdds" @edit="addFile"/></v-tab-item>
                <v-tab-item><shopmag-02-form :addLists="this.fileAddsB" @edit="addFile"/></v-tab-item>
                <v-tab-item><shopmag-02-form :addLists="this.fileAddsC" @edit="addFile"/></v-tab-item>

            </v-tabs-items>            
        </v-card-text>
    </v-card>
    
    <ez-dialog label="사업 추가 / 수정" ref="dialog" max-width="400" dark color="primary" persistent>
        <shopmag-update-form @save="save1" 
            :shopinfo="itemShop" :isNew="isNew" :cbShopId="cbShopIdChk">
        </shopmag-update-form>
    </ez-dialog>
    <ez-dialog label="첨부서류" ref="dialog2" max-width="450" dark color="primary" persistent>
        <shopmag-att-file-form @save="save2" @onDelete="onDelete"
            :addFileInfo="fileAdd" :isNew="isAddNew" :cbSerId="cbSerChk"  :isLoading="isLoading" :maxno="maxno" :fgubun="this.tabs">
        </shopmag-att-file-form>
    </ez-dialog>
    </v-container>

</template>

<script>
import { mapActions, mapMutations } from "vuex";
import { deepCopy } from "../../../util/lib";
import Login from '../member/Login.vue'
import TooltipBtn from "../../components/etc/TooltipBtn.vue";
import EzDialog from '../../components/etc/EzDialog.vue';
import Shopmag01Form from './Shopmag01Form.vue';
import Shopmag02Form from './Shopmag02Form.vue';
import ShopmagUpdateForm from './ShopmagUpdateForm.vue';
import ShopmagAttFileForm from './ShopmagAttFileForm.vue';


export default {
  components: { Login, TooltipBtn, EzDialog, Shopmag01Form, Shopmag02Form, ShopmagUpdateForm, ShopmagAttFileForm },

	name :"ShopMag",
	title : "사업관리",
    data() {
        return {            
            tabs: parseInt(this.$route.query.tabs) || 0 ,
            isLoading: false,
            itemShops: [],
            itemShop: null,
            fileAdds: [],
            fileAddsB: [],
            fileAddsC: [],
            fileAdd: null,
            isNew: true,
            isAddNew: true,
            idx: -1,          
            i_shop_select: null,
            maxno: 0,            
            fgubun: "0",
        }
        
    },
    mounted() {        
        if (this.$store.state.user.member ) {
            this.fetchData();
        }
        window.addEventListener('beforeunload', this.leave)
    },
    beforeUnmount() {
        window.removeEventListener('beforeunload', this.leave)
    },
    watch: {
        async tabs() {
            if (this.tabs > 0) {   
                if ( this.idx === -1 ) {                    
                    if (this.itemShops) { this.idx = 0 }
                } 
                this.i_shop_select = this.itemShops[this.idx].i_shop;
                
                if ( this.tabs === 1) this.fileAdds = await this.$axios.get(`/api/shopinfo/getShopMagFile?i_shop=${ this.i_shop_select }&f_gubun=1`);
                if ( this.tabs === 2) this.fileAddsB = await this.$axios.get(`/api/shopinfo/getShopMagFile?i_shop=${ this.i_shop_select }&f_gubun=2`);
                if ( this.tabs === 3) this.fileAddsC = await this.$axios.get(`/api/shopinfo/getShopMagFile?i_shop=${ this.i_shop_select }&f_gubun=3`);
            }
        }
    },
    methods: {
        ...mapActions("shop", ["duplicateCheckShop", "shopInfoSave", "shopAddFile", "shopAddFileDelete"]),
        ...mapMutations("user", ["SET_SHOPINFO"]),

        leave(event) {
		    event.preventDefault();
		    event.returnValue = '';
	    },
        getmaxno(flag) {
            //console.log("getmaxno", flag);
            this.maxno = 0;
            if ( flag === 1 ) {
                if (this.fileAdds) {
                    for(let ob in this.fileAdds) {
                        if (this.fileAdds[ob].i_sort > this.maxno) this.maxno = this.fileAdds[ob].i_sort;
                    }
                }
                
            } else if ( flag === 2 ) {
                if (this.fileAddsB) {
                    for(let ob in this.fileAddsB) {
                        if (this.fileAddsB[ob].i_sort > this.maxno) this.maxno = this.fileAddsB[ob].i_sort;
                    }
                }
            } else  if ( flag === 3 ) {
                if (this.fileAddsC) {
                    for(let ob in this.fileAddsC) {
                        if (this.fileAddsC[ob].i_sort > this.maxno) this.maxno = this.fileAddsC[ob].i_sort;
                    }
                }                
            } else {
                this.maxno = 0;
            }
        }, 

        async fetchData() {
            this.itemShops = await this.$axios.get("/api/shopinfo/getShopMag");               
        },        
        async addShop(item) {
           if (item) {             
                this.isNew = false;                  
                this.itemShop = deepCopy(item);
            } else {                
                this.isNew = true;
                this.itemShop = null;
            }
            this.$refs.dialog.open();
        },
        async cbShopIdChk(value) {
            const payload = {
                field: "i_shop",
                value,
            };
            return await this.duplicateCheckShop(payload);
        },

        async selectRow(index, item) {
            this.idx = index;           
        },

        async save1(form) {
            // 사업관리 추가 및 수정 처리 
            const data = await this.shopInfoSave(form);           
            if (this.isNew) {
                this.$toast.info(`${form.i_shop} 추가 하였습니다.`);                
            } else {
                this.$toast.info(`${form.i_shop} 수정 하였습니다.`);
            }
            this.fetchData();
            this.$refs.dialog.close();
        },

        async addFile(item) {    
             if (item) {                
                this.isAddNew = false;  
                this.fileAdd = deepCopy(item);
            } else {                
                this.getmaxno(this.tabs);                
                this.isAddNew = true;
                this.fileAdd = null;
            }            
            this.$refs.dialog2.open();
        },        

        async cbSerChk(value) {
            const payload = {
                field: "i_shop",
                value,
            };
            return await this.duplicateCheckShop(payload);
        },
        

        async save2(form) {
            form.append("isNew", this.isAddNew);
            form.append("i_shop_select", this.i_shop_select);
          
            const data = await this.shopAddFile(form);
            
            if (this.isAddNew) {
                this.$toast.info(`추가 하였습니다.`);
            } else {
                this.$toast.info(`수정 하였습니다.`);
            }
            if ( this.tabs === 1) this.fileAdds = await this.$axios.get(`/api/shopinfo/getShopMagFile?i_shop=${ this.i_shop_select }&f_gubun=1`);
            if ( this.tabs === 2) this.fileAddsB = await this.$axios.get(`/api/shopinfo/getShopMagFile?i_shop=${ this.i_shop_select }&f_gubun=2`);
            if ( this.tabs === 3) this.fileAddsC = await this.$axios.get(`/api/shopinfo/getShopMagFile?i_shop=${ this.i_shop_select }&f_gubun=3`);
            this.$refs.dialog2.close();
        },          

        async onDelete(form) {
            const data = await this.shopAddFileDelete(form);
            if ( this.tabs === 1) this.fileAdds = await this.$axios.get(`/api/shopinfo/getShopMagFile?i_shop=${ this.i_shop_select }&f_gubun=1`);
            if ( this.tabs === 2) this.fileAddsB = await this.$axios.get(`/api/shopinfo/getShopMagFile?i_shop=${ this.i_shop_select }&f_gubun=2`);
            if ( this.tabs === 3) this.fileAddsC = await this.$axios.get(`/api/shopinfo/getShopMagFile?i_shop=${ this.i_shop_select }&f_gubun=3`);
            this.$refs.dialog2.close();
        },

        async onClose() {
            console.l("onClose");
        }

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
</style>