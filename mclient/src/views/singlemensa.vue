<template>
<div>
	<div v-if="data.hasMenu" :class="[$style.upperextend, upperextend===1?$style.extendopen:'']">
		<datePicker v-if="additionaldata" :loading="((this.menu===false) ? true : false)" :initialDate="this.showDate.mmt" :times="additionaldata.location.times"></datePicker>
	</div>
	<div class="adaptiveWrap">
		<div :class="$style.headlineContainer">
			<mensaInfo :basicdata="basicdata" :additionaldata="additionaldata"></mensaInfo>
		</div>
		<message v-for="(message, index) in messages" :key="index" :msg="message">{{message.text}}</message>
		<div>
			<div v-if="menu===false" class="whitebox" v-for="index in 2">
				<div class="whitebox_header">
					{{ $t('state.loading')+'...' }}
				</div>
				<foodItemLoad v-for="idx in getRandomInt(2,8)" :key="idx"></foodItemLoad>
			</div>
			<div v-if="menu" class="whitebox" v-for="category in menu">
				<div :class="['whitebox_header', $style.menuheader]">
					<div :class="$style.headline">{{category.displayName}}</div>
					<div :class="$style.actions" v-on:click="flipExtended(category)"><ActionButton :class="[$style.extendarrow, category.extended?$style.rotate180:'']" :info="acBtn_arrow"></ActionButton></div>
				</div>
				<FoodItem v-if="category.extended" v-for="(item, index) in category.items" :key="index" :info="item"></FoodItem>
			</div>
		</div>
	</div>
</div>
</template>

<script>
import moment from "moment";
import foodItemLoad from './../components/foodItemLoad.vue';
import datePicker from './../components/date_picker.vue';
import message from './../components/message.vue';
import icon from './../components/icon.vue';
import FoodItem from './../components/food_item.vue';
import mensaInfo from './../components/mensainfo.vue';
import ActionButton from './../components/action_button.vue';

import Helpers from './../classes/Helpers.js'

export default {
	data () {
		let expand_more = require('./../assets/expand_more.svg');
		return {
			basicdata: undefined,
			additionaldata: false,
			menu: undefined,
			messages: [],
			showDate: {name: false, mmt: moment(this.data.whenOpen)},
			back: require('./../assets/back.svg'),
			daterange: require('./../assets/date_range.svg'),
			acBtn_arrow: { svg: expand_more, function: ()=>{} },
			upperextend: 0
		}
	},
	props: ['data'],
	created: function () {
		bus.$on('changeDate', this.changeDate);
	},
	mounted: function() {
		console.log(this.data);
		let actionsConf = [[
			{
			svg: this.back,
			function: this.goBack
		}], []]

		if (this.data.hasMenu) {
			actionsConf[1] = actionsConf[1].concat([
			{
				svg: this.daterange,
				function: ()=>{
					this.upperextend = (this.upperextend==1)?0:1;
				}
			}]);
		}

		bus.$emit('setActions', actionsConf);


		this.additionaldata = false;
		this.getMenu();

		let res = this.$root.$data.storageC.getMensa(this.data._id, this.data.type);
		this.basicdata = (res!==undefined) ? res : false;

		this.$root.$data.netC.getSingleMensa([{_id: this.data._id}]).then((result) => {
			this.additionaldata = result[0];

			let additives = this.$root.$data.storageC.settings.additives;
			let unsupportedAdditives = this.additionaldata.unsupportedAdditives;

			if ((additives.length > 0) && (unsupportedAdditives.length > 0)) {
				let bucket = [];
				for (var i = 0; i < additives.length; i++) {
					if (unsupportedAdditives.indexOf(additives[i]) >= 0)
						bucket.push(additives[i]);
				}
				if (bucket.length > 0) {
						let msg = {
							id: "additiveswarn",
							headline: this.$t('result.additives_warn'),
							text: this.$t('result.additives_nosupport')+" "
						}

					this.$root.$data.netC.getAdditives().then((result) => {
						let language = this.$root.$data.storageC.settings.language;
						let x = Helpers.translateAdditives(result, bucket, language);
						console.log(x);
						for (var i = 0; i < x.length; i++) {
							msg.text += x[i].name;
							if (i+1 < x.length) msg.text += ", ";
						}
						this.messages.push(msg);
					},
					(reason) => {
						for (var i = 0; i < bucket.length; i++) {
							msg.text += bucket[i]+" ";
							if (i+1 < bucket.length) msg.text += ", ";
						}
						this.messages.push(msg);
					});
				}

			}

			if (!this.basicdata) {
				this.basicdata = {
					nameA: result[0].nameA,
					nameB: result[0].nameB,
					hasMenu: result[0].hasMenu
				};
			}
		},
		(reason) => {

		});
	},
	methods: {
		flipExtended: function (obj) {
			obj.extended = !obj.extended;
		},
		goBack: function () {
			window.history.back();
		},
		changeDate: function (newDate, update=true) {
			this.showDate = newDate;

			bus.$emit('updateAction', 1, 0, {
				text: this.showDate.name,
				function: ()=>{
					this.upperextend = (this.upperextend==1)?0:1;
				}
			});

			if (update) this.getMenu();
		},
		getMenu: function() {
			if (this.menu===false) return;
			this.menu = false;
			if (this.data.hasMenu) {
				this.$root.$data.netC.getMenu(this.data._id, this.showDate.mmt).then((result) => {
					this.menu = this.evalMenu(result);
				},
				(reason) => {

				});
			} else this.menu = [];
		},
		evalMenu: function(menu) {

			menu = Helpers.cloneArray(menu);

			let sorting = this.$root.$data.storageC.settings.sorting;
			menu = Helpers.menuSort(menu, sorting);

			let diet = this.$root.$data.storageC.settings.diet;
			menu = Helpers.multiMenuDiet(menu, diet);

			let thisAdditives = this.$root.$data.storageC.settings.additives;
			menu = Helpers.multiMenuAdditives(menu, thisAdditives);

			for (var i = 0; i < menu.length; i++) {
				if (this.$te('menuSection.'+menu[i].name))
					menu[i].displayName = this.$t('menuSection.'+menu[i].name);
				else
					menu[i].displayName = menu[i].name;
					menu[i].highlightCount = 0;
					if (menu[i].extended===undefined)
						menu[i].extended = true;
			}
			let hls = this.$root.$data.storageC.settings.highlights;
			for (var h = hls.length - 1; h >= 0; h--) { // hls[h]
				for (var m = menu.length - 1; m >= 0; m--) { // menu[m]
					for (var i = menu[m].items.length - 1; i >= 0; i--) { // menu[m].items[i]
						if (menu[m].items[i].name.toLowerCase().includes(hls[h])) {
							menu[m].items[i].highlight = true;
							menu[m].highlightCount++;
						}
					}
				}
			}
			return menu;
		},
		getRandomInt: Helpers.getRandomInt
	},
	components: {
		foodItemLoad,
		icon,
		FoodItem,
		datePicker,
		mensaInfo,
		ActionButton,
		message,
		moment
	}
}
</script>

<style module>
	.headlineContainer {
		display: flex;
		justify-content: center;
		padding: 15px 20px 40px 20px;
	}
	.loading {
		height: 14px;
		margin-top: 2px;
	}
	.loadingbig {
		height: 16px;
	}

	.elem {
		display: flex;
	}
	.elemmid {
		flex: 1;
		display: flex;
		flex-flow: column;
		justify-content: center;
	}

	.upperextend {
		background-color: #ebebeb;
		display: flex;
		margin-bottom: 25px;
		max-height: 0;
		overflow: hidden;
		transition: max-height .3s;
	}
	.extendopen {
		max-height: 100px;
	}
	.dateel {
		padding: 20px;
	}

	.menuheader {
		display: flex;
		align-items: center;
		padding: 0;
	}
	.headline {
		flex: 1;
		display: inline-block;
		padding: 0 20px;
	}
	.actions {
		fill: #817575;
    	transition: all .5s;
	}

	.extendarrow svg {
		transition: transform .2s;
	}
	.rotate180 svg {
		transform: rotate(180deg);
	}
</style>
