<template> 
	<div>
		<input :class="inputStyle" ref="txtInput" :placeholder="placeholder" class="form-control" type="text" :value="value" @input="updateValue($event.target.value)"
		  @keydown.enter = 'enter'
		  @keydown.down = 'down'
		  @keydown.up = 'up'
		>
		<div v-if="open" :class="[$style.dropdown]">
			<div v-for="(suggestion, index) in matches"
				:class="[isActive(index)?$style.active:'', $style.chip]"
				@click="suggestionClick(index)">
				{{suggestion.name}}
			</div>
		</div>
	</div>
</template>

<script>
export default {
name: 'autocomplete',
	data () {
		return {
			open: false,
			current: 0
		}
	},
	props: {
		value: {
			type: String,
			required: true
		},
		suggestions: {
			type: Array,
			required: true
		},
		inputStyle: {},
		placeholder: String
  },
	computed: {
		matches () {
			return this.suggestions.filter((obj) => {
				return (obj.name.toLowerCase().indexOf(this.value.toLowerCase()) >= 0)
			})
		},
		openSuggestion () {
			return this.selection !== '' &&
				this.matches.length !== 0 &&
				this.open === true
		}
	},
	methods: {
		// Triggered the input event to cascade the updates to 
		// parent component
		updateValue (value) {
			if (this.open === false) {
				this.open = true
				this.current = 0
			} else if (value.length < 1) this.open = false;
			this.$emit('input', value)
		},

		// When enter key pressed on the input
		enter () {
			if (this.matches[this.current]!==undefined) {
				this.$emit('input', this.matches[this.current].id);
				this.$emit('inputFinal', this.matches[this.current].id);
			}
			this.open = false
		},

		// When up arrow pressed while suggestions are open
		up () {
			if (this.current > 0) {
				this.current--
			}
		},

		// When down arrow pressed while suggestions are open
		down () {
			if (this.current < this.matches.length - 1) {
				this.current++
			}
		},

		// For highlighting element
		isActive (index) {
			return index === this.current
		},

		// When one of the suggestion is clicked
		suggestionClick (index) {
			if (this.matches[this.current]!==undefined) {
				this.$emit('input', this.matches[index].id);
				this.$emit('inputFinal', this.matches[index].id);
			}
			this.open = false;
		}
	}
}
</script>

<style module>


	.wrap {
		width: 0;
	}

	.dropdown {
	}

	.chip {
		padding: 10px;
		border-top: 1px solid #e3e3e3;
	}
	.chip:hover {
		cursor: pointer;
		background-color: #e3e3e3;
	}
	.active {
		background-color: #f6f6f6;
	}
</style>