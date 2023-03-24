<template>
    <v-form @submit.prevent="save" ref="form" v-model="valid" lazy-validation>
        <v-radio-group label="구분 : " row v-model="form.f_gubun" readonly>
            <v-radio label="신청서" value="1"></v-radio>
            <v-radio label="추가정보" value="2"></v-radio>
            <v-radio label="협약정보" value="3"></v-radio>
        </v-radio-group>
        <v-text-field label="순번 : " type="number" v-model="form.i_sort" />
        <v-radio-group label="필수 : " row v-model="form.f_yn">
            <v-radio label="필수" value="1"></v-radio>
            <v-radio label="선택" value="0"></v-radio>
        </v-radio-group>
        <v-text-field label="명칭 : " v-model="form.n_nm" />
        <v-text-field label="첨부서류 : " v-model="form.n_file"  />
        <div class="d-flex align-center">            
            <v-text-field label="첨부(양식)" v-model="form.t_filenm" readonly @dblclick="downLoad()" />
            <v-file-input label="첨부변경" v-model="form.t_image"
               :prepend-icon="null" :multiple="false"  @change="getFilename($event)" /> 
            <v-checkbox v-if="form.t_filenm" label="삭제" v-model="form.f_del" > </v-checkbox>
        </div>
        <v-textarea label="설명 : " v-model="form.t_remark" />        
        <v-btn type="submit" block color="primary" :loading="isLoading">{{isNew?'추  가':'수  정'}}</v-btn>
        <v-btn block @click="onDelete" :loading="isLoading" v-if=!isNew>삭 제</v-btn> 
    </v-form>
</template>

<script>
import { deepCopy } from '../../../util/lib';
import { save } from 'save-file';
import validateRules from "../../../util/validateRules";
import InputDate from '../../components/InputForms/InputDate.vue';
import InputDuplicateCheck from '../../components/InputForms/InputDuplicateCheck.vue';

export default {
  components: { InputDate, InputDuplicateCheck },
    name: "ShopmagUpdateForm",
    props: {
        addFileInfo: {
            type: Object,
            default: null,
        },
        cbSerId: {
            type: Function,
            default: null,
        },
        isNew : Boolean, 
        isLoading : Boolean,
        maxno : 0,
        fgubun : null,
    },
    data() {
        return {
            valid: true,
            form: {
                i_shop: "",
                i_ser: "",
                f_gubun: "",
                f_yn: "",
                n_nm: "",
                n_file: "",
                t_filenm: "",
                t_remark: "",
                t_sample: null,
                i_sort : 0,
                f_del: null,
                t_image: null,
            },            
        }
    },
    created() {        
        this.init();        
    },    
    destroyed() {        
        this.form = null;
    },
    watch: {        
        addFileInfo() { this.init(); },
        fgubun() { this.init(); },
        maxno() { this.init(); },
        isNew() { this.init(); },
    },
    computed: {
        rules: () => validateRules,
        // originKey() {            
        //    return this.addFileInfo ? this.addFileInfo.i_ser : "";            
        // },
    },

    methods: {
        async save() {
            // this.$refs.form.validate();
            // await this.$nextTick();
            // if (!this.valid) return;
            // if (!this.$refs.i_ser.validate()) return;
            
            const formData = new FormData();
			const keys = Object.keys(this.form);
            for (const key of keys) {
                formData.append(key, this.form[key]);
            };
            this.$emit("save", formData);
        },
        init() {            
            if (this.addFileInfo) {                
                this.form = deepCopy(this.addFileInfo);
            } else {                
                this.form = {
                    i_shop: "",
                    i_ser: 0,
                    f_gubun: this.fgubun.toString(),
                    f_yn: '1',
                    n_nm: "",
                    n_file: "",
                    t_filenm: "",
                    t_remark: "",
                    t_sample: null,
                    i_sort: this.maxno + 1,
                    f_del: null,
                    t_image: null,
                }
            };     
            if (this.$refs.form) {
                this.$refs.form.resetValidation();
            };
        },
        onClose() {
            console.log("onClose");
        },
        async onDelete() {
             const res = await this.$ezNotify.confirm("삭제 하시겠습니까 ?", this.form.n_file);
             if (res) {
                this.$emit('onDelete', this.form);
             }
        },
        async getFilename(files, item) {
            if (files) {        
                this.form.t_sample = files.name;
                this.form.f_del = null;
            }
        },
        async downLoad() {
            if(this.form.t_sample && this.form.t_filenm) {                
                const fileName = `https://protagonist.kro.kr${this.form.t_sample}`;
                const downFile = this.form.t_filenm;

                const fileBuffer = await this.$axios.get(`/api/shopinfo/getFileDown?path=${ this.form.t_sample }`);            
                if (fileBuffer) {
                    save (fileBuffer, downFile);                
                    alert('File Donw load Click !!!!!'); 
                } else {
                    await this.$ezNotify.alert("다운로드 실패 !!", "오류" );
                }
                // try {
                //     const response = await fetch(fileName)
                //     const blob = await response.blob();
                //     const url = await URL.createObjectURL(blob)

                //     const a = document.createElement("a");
                //     a.href = url;        
                //     a.download = downFile;
                //     document.body.appendChild(a);
                //     a.click();
                //     document.body.removeChild(a);
                // } catch(err) {
                //     console.log({ err })
                // }
            }
        }
    }
}
</script>

<style>

</style>