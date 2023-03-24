<template>
    <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation @@submit.prevent="edit">
        <v-data-table :headers="headers" :items="form" @dblclick:row="showRowInfo" @click:row="selectRow" class="mytable">
        </v-data-table>
    </v-form>
    
</template>

<script>
import { deepCopy } from "../../../util/lib";
export default {
    name: "Shopmag01Form",
    props: {        
        itemLists: {
            type: Array,
            default: null,
        },
    },
    data() {
        return {
            valid: true,
            headers: [
                { text: '신청번호',  value: 'i_shop', sortable: false, width: "100px", fixed: true, align:'center'},
                { text: '사업명', value: 'n_shop', sortable: false,  },
                { text: '사업시작', value: 'd_date1', sortable: false, width: "150px", fixed: true, align:'center'}, 
                { text: '사업종료', value: 'd_date2', sortable: false, width: "150px", fixed: true, align:'center'},
                { text: '비고', value: 't_remark', sortable: false, width:"35%"}  
            ],
            form: {
                i_shop: "",
                n_shop: "",
                d_date1: "",
                d_date2: "",
                t_remark: "",                
            },
            isSelecting: false,
        }
    },
    created() {
        this.init();
    },
    watch: {
        itemLists() {
            this.init();
        }
    },
    methods: {
        init() {
            if (this.itemLists) {       
                this.form = deepCopy(this.itemLists);
            } else {

            }
        },
        async showRowInfo(event, { item }) {            
            await this.$emit("edit", item );
        },
        async save() {
            this.$emit("save");
        },
        async selectRow(event, { index, item }) {             
            this.$emit("select", index, item);
        },
    }
}
</script>

<style>

</style>