<template>
  <li>
    <v-icon class="handle">mdi-drag</v-icon>
    <table>
      <tr>
        <td>
          <b>{{ item.cf_name }}</b>
        </td>
        <td><pre class="comment" v-html="item.cf_comment"></pre></td>
        <td>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-avatar v-on="on" v-bind="attrs" color="primary" dark size="32">
                <span class="white--text">{{ item.cf_level }}</span>
              </v-avatar>
            </template>
            <span>접근레벨</span>
          </v-tooltip>
        </td>
        <td>
          <v-btn icon color="primary" @click="$emit('update', item)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </td>
      </tr>
      <tr>
        <td>
          <b>{{ item.cf_key }}</b>
        </td>
        <td>
          <type-value v-model="item.cf_val" :fieldType="item.cf_type" :readonly="true"/>
        </td>
        <td>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <div class="client" v-on="on" v-bind="attrs">
                <v-checkbox
                  v-model="item.cf_client"
                  readonly
                  hide-details
                  dense
                />
              </div>
            </template>
            <span>클라이언트 접근</span>
          </v-tooltip>
        </td>
        <td>
          <v-btn icon color="error" @click="$emit('remove', item)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </td>
      </tr>
    </table>
  </li>
</template>

<script>
import TypeValue from './TypeValue.vue';
export default {
  components: { TypeValue },
  name: "ConfigItem",
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style>
</style>