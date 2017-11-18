<template>
<div class="container">
    <div class="box auth-box">
			<h2 class="title is-4">Login</h2>
            <p>Haven't set up a password yet? Please register <router-link to="register">here</router-link></p>
            <p v-show="errorLoading">Did you forget your password? <a @click="sendPassReset">Password reset link</a></p>
            <br>
			<section>
				<b-field label="Email">
					<b-input ref="email" v-model.trim="email" type="email" icon="email"></b-input>
				</b-field>
				<b-field label="Password">
					<b-input ref="password" v-model="password" type="password" icon="lock"></b-input>
				</b-field>
                <p class="control">
                    <button v-show="!loading" v-bind:class="{ 'is-success': successLoading, 'is-dark' : !loadingComplete, 'is-danger': errorLoading}" class="button is-primary" @click="submitRegistration">
                        <span>Log In</span>
                        <b-icon icon="alert" v-show="errorLoading"></b-icon>
                        <b-icon icon="check" v-show="successLoading"></b-icon>
                    </button>
                </p>
                <sync-loader class="submit-spinner" :loading="loading" :color="spinnerColor" :size="spinnerSize"></sync-loader>
			</section>
    </div>
</div>
</template>

<script>
import SyncLoader from 'vue-spinner/src/SyncLoader.vue'

export default {
    name: 'login',
    components: {SyncLoader},
    data() {
        return {
            email: "",
            password: "",
            spinnerColor: '#7957d5',
            spinnerSize: '10px',
            loading: false,
            loadingComplete: false,
            errorLoading: false,
            successLoading: false
        }
    },
    methods: {
        sendPassReset() {
            if(!(this.$refs.email.isValid)) {
                this.$snackbar.open({
                    message: "Invalid email format. Please fix before submitting",
                    type: "is-warning",
                    position: "is-top-right"
                });
                return null;
            } else {
                this.$http.post('/auth/forgot', {email: this.email})
                    .then(resp => {
                        this.$snackbar.open({
                            message: `Sent a password reset link to ${this.email}`,
                            type: "is-light",
                            position: "is-top-right"
                        });
                        console.log(resp);
                    })
                    .catch(err => {
                        console.log(err.response);
                        const msg = err.response.status === 500 ? err.response.data.error : "Please contact the commissioner";
                        this.$snackbar.open({
                            message: `Something went wrong. ${msg}`,
                            type: "is-warning",
                            position: "is-top-right"
                        });
                    });
            }
        },
        submitRegistration() {
            this.loading = true;
            if(!(this.$refs.email.isValid)) {
                this.$snackbar.open({
                    message: "Invalid email format. Please fix before submitting",
                    type: "is-warning",
                    position: "is-top-right"
                });
                this.loading = false
                return null;
            } else {
                this.$http.post('/auth/login', { email: this.email, password: this.password })
                    .then(resp => {
                        this.$snackbar.open({
                            message: "Logged in successfully.",
                            type: "is-light",
                            position: "is-top-right"
                        });
                        console.log(resp);
                        this.loading = false;
                        this.errorLoading = false;
                        this.loadingComplete = true;
                        this.successLoading = true;
                        this.$router.push({ name: 'tradeSubmit'});
                    })
                    .catch(err => {
                        if(err) {
                            const msg = err.response.status === 500 ? err.response.data.error : "Please contact the commissioner";
                            this.$snackbar.open({
                                message: `Something went wrong. ${msg}`,
                                type: "is-warning",
                                position: "is-top-right"
                            });
                        }
                        this.loading = false;
                        this.loadingComplete = true;
                        this.successLoading = false;
                        this.errorLoading = true;
                    });
            }
        }
    }
  
}
</script>

<style>

</style>
