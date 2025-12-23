<template>
     <div style="height:220px">
          {{ `${nowKR}` }}
          <v-data-table ref="data-table" :headers="itemHead" :items="itemList"                     
                    item-key="i_orderser" single-select 
                    :item-class= "row_classes" :items-per-page="-1"  hide-default-footer :footer-props="{'items-per-page-options': [10, 20, 30, 40, 50, 100, -1]}" 
                    class="elevation-1 text-no-wrap"  max-height="350px"  height="350px" 
                    >
            <template v-slot:header="">
                <thead align='center'>
                    <tr>
                        <th colspan="4" class="text-center">수주정보</th>
                        <th colspan="5" class="text-center">제품정보</th>
                        <th colspan="4" class="text-center">생산계획</th>
                    </tr>
                </thead>
            </template>            
            <template v-slot:item="{ item,index }">                
                <tr :class="{ 'row_select': item === selected }" class="center-align" v-if="shouldMergeRow(item) ">
                    <td> {{ index + 1 }}</td>
                    <td :rowspan="getRowspan(item)">{{ item.i_orderno }}</td>
                    <td :rowspan="getRowspan(item)">{{ item.s_date }}</td>
                    <td :rowspan="getRowspan(item)" >{{ item.n_vend }}</td>                    
                    <td class="left-align"> {{ item.n_item }}</td>
                    <td class="left-align"> {{ item.t_size }}</td>
                    <td> {{ item.i_unit }}</td>
                    <td> {{ item.m_cnt }}</td>
                    <td> {{ item.s_duedate }}</td>
                    
                    <td align='center'><v-chip x-small :color="getColor(item.f_work)" dark>{{getStatus(item.f_work)}}</v-chip></td>
                    <td align='center'>{{item.d_plan1}}</td>
                    <td align='center'>{{item.d_plan2}}</td>
                    <td align="left"> {{item.t_remark}} </td>
                </tr>
                <tr :class="{ 'row_select': item === selected }" class="center-align" v-else>
                    <td> {{ index + 1 }}</td>
                    <td class="left-align"> {{ item.n_item }}</td>
                    <td class="left-align"> {{ item.t_size }}</td>
                    <td> {{ item.i_unit }}</td>
                    <td> {{ item.m_cnt }}</td>
                    <td> {{ item.s_duedate }}</td>
                    <td align='center'><v-chip x-small :color="getColor(item.f_work)" dark>{{getStatus(item.f_work)}}</v-chip></td>
                    <td align='center'>{{item.d_plan1}}</td>
                    <td align='center'>{{item.d_plan2}}</td>
                    <td align="left"> {{item.t_remark}}</td>
                </tr>
            </template>           
        </v-data-table>
     </div>
</template>
<script>
import {getDay, dateToKorean} from '../../../util/lib';
import { PROD001 } from '../../../util/constval';
export default {
     name: 'DataTableBox',
     data() {
        return {      
               PROD001,
               now:'',
               itemHead: [
                    {text: 'No',       sortable: false, align:'center', width: "25"},
                    {text: '수주번호',  value: 'i_orderno', sortable: false, align:'center', width: "75"},
                    {text: '수주일',    value: 's_date', sortable: false, align:'center', width: "60px"},                
                    {text: '발주처',    value: 'n_vend', sortable: false, align:'center', width: "120px"},
                    {text: '항목(품목)', value: 'n_item', sortable: false, align:'center', width: "130px"},
                    {text: '규격(사양)', value: 't_size', sortable: false, align:'center', width: "100px"},
                    {text: '단위',      value: 'i_unit', sortable: false, align:'center', width: "50px"},
                    {text: '수량',      value: 'm_cnt', sortable: false, align:'center', width: "30px"},
                    {text: '납기일',    value: 's_duedate', sortable: false, align:'center', width: "60px"},
                    {text: '상태',      value: 'f_work', sortable: false, align:'center', width: "30px"},
                    {text: '시작일',    value: 'd_plan1', sortable: false, align:'center', width: "60px"},
                    {text: '종료일',    value: 'd_plan2', sortable: false, align:'center', width: "60px"},
                    {text: '비고',      value: 't_remark', sortable: false, align:'center', width: "300px"},
               ],
               itemList:[], itemInfo:[], selected:[],
          }
     },
     mounted () {          
          this.now = getDay();
          this.nowKR = dateToKorean(this.now)
          this.display(); 
     },  
     methods: { 
          async display() {
               this.itemList = await this.$axios.post(`/api/maindashboard/getDataTable`, {today: this.now});
          },
          shouldMergeRow(item) {
               const index = this.itemList.findIndex((i) => i.i_orderno === item.i_orderno);
               return index === this.itemList.indexOf(item);
          },        
          getRowspan(item) {
               const count = this.itemList.filter((i) => i.i_orderno === item.i_orderno).length;
               return count;
          },
          getColor (data) {
            if(data == "1") { return 'red'; } 
            else if (data == "2") {return 'blue';}
            else { return 'green';}
          },
          getStatus(item) {
               var find = this.PROD001.find(e => e.value === item);
               return find !== undefined ? find.label : '';
          },
          row_classes(item) {
               if (item.f_edit == "2") {
                    return "orange";
               } 
          },
     },
}
</script>
