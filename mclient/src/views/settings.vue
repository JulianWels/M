<template>
	<div>
		<div :class="$style.headline"><h1>{{ $t('frame.settings') }}</h1></div>
		<div class="adaptiveWrap">
			<div :class="$style.section">{{ $t('language.this') }}</div>
			<languageSelector class="whitebox"></languageSelector>
	
			<div :class="$style.section">{{ $t('prices.category') }}</div>
			<priceSelector class="whitebox"></priceSelector>
	
			<div :class="$style.section">{{ $t('settings.customize') }}</div>
			<orderSelector></orderSelector>

			<div :class="$style.section">{{ $t('settings.location.this') }}</div>
			<locationSelector class="whitebox"></locationSelector>
	
			<div :class="$style.section">{{ $t('settings.dietarypreferences') }}</div>
			<dietSelector class="whitebox"></dietSelector>
	
			<div :class="$style.section">{{ $t('settings.search_and_hightlight') }}</div>
			<chipsfield :stringCase="false" :items="this.$root.$data.storageC.settings.highlights" :class="[$style.chipsfield, 'whitebox']"></chipsfield>
	
<!-- 			<div :class="$style.section">{{ $t('settings.transport') }}</div>
			<settingsTransport class="whitebox"></settingsTransport> -->
	
			<div :class="$style.section">{{ $t('settings.mensa_selector') }}</div>
			<mensaselector></mensaselector>
		</div>
	</div>
</template>

<script>
import priceSelector from './../components/price_selector.vue';
import languageSelector from './../components/language_selector.vue';
import orderSelector from './../components/order_selector.vue';
import dietSelector from './../components/diet_selector.vue';
import chipsfield from './../components/chipsfield.vue';
import mensaselector from './../components/mensaselector.vue';
import locationSelector from './../components/location_selector.vue';
// import settingsTransport from './../components/settings_transport.vue';

export default {
	data () {
	return {

	}
	},
	components: {
		priceSelector,
		languageSelector,
		chipsfield,
		mensaselector,
		orderSelector,
		dietSelector,
		locationSelector
	}
}
</script>

<style module>
	.chipsfield {
		overflow: hidden;
		flex-grow: 1;
		min-height: 25vh;
	}
	.headline {
		color: #303030;
		font-family: 'Roboto Condensed', sans-serif;
		text-align: center;
		margin-bottom: 10px;
	}
	.section {
		font-family: 'Roboto Condensed', sans-serif;
		text-transform: uppercase;
		padding-top: 10px;
		padding-bottom: 10px;
		text-align: center;
	}
</style>
