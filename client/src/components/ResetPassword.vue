<template>
<div class="container">
    <div class="box auth-box">
			<h2 class="title is-4">Reset Password</h2>
			<section>
            <p>Don't need to reset after all? <router-link to="/login">Login</router-link> or <router-link to="/register">Regsiter</router-link>.</p>
            <p v-show="expiredToken">Looks like your reset token expired :( Try sending a new email to the email below</p>
            <br>
            	<b-field v-show="expiredToken" label="Email">
					<b-input ref="email" v-model.trim="email" type="email" icon="email"></b-input>
				</b-field>
				<b-field v-show="!expiredToken" label="New Password">
					<b-input ref="password" v-model="password" type="password" icon="lock"></b-input>
				</b-field>
				<b-field v-show="!expiredToken" label="Re-enter Password">
					<b-input ref="repeatPass" v-model="repeatPass" type="password" icon="lock"></b-input>
				</b-field>
                <p v-show="!expiredToken" class="control">
                    <button v-show="!loading" v-bind:class="{ 'is-success': successLoading, 'is-dark' : !loadingComplete, 'is-danger': errorLoading}" class="button is-primary" @click="submitNewPass">
                        <span>Submit</span>
                        <b-icon icon="alert" v-show="errorLoading"></b-icon>
                        <b-icon icon="check" v-show="successLoading"></b-icon>
                    </button>
                </p>
                <button v-show="expiredToken" class="button is-primary" @click="sendPassReset">Send Reset Email</button>
                <sync-loader class="submit-spinner" :loading="loading" :color="spinnerColor" :size="spinnerSize"></sync-loader>
			</section>
    </div>
</div>
</template>

<script>
import SyncLoader from 'vue-spinner/src/SyncLoader.vue'

export default {
    name: 'reset-password',
    components: {SyncLoader},
    data() {
        return {
            token: this.$route.params.token,
            email: "",
            password: "",
            repeatPass: "",
            loadingComplete: false,
            errorLoading: false,
            expiredToken: false,
            successLoading: false,
            spinnerColor: '#7957d5',
            spinnerSize: '10px',
            loading: false
        }
    },
    created() {
        this.$http.get(`/auth/reset/${this.token}`)
            .then(resp => {
                console.log(resp);
            })
            .catch(err => {
                const msg = err.response.status === 500 ? err.response.data.error : "Please contact the commissioner";
                this.$snackbar.open({
                    message: `Something went wrong. ${msg}`,
                    type: 'is-warning',
                    position: 'is-top-right'
                });
                this.expiredToken = true;
            });
    },
    methods: {
        sendPassReset() {
            if(!(this.$refs.email.isValid)) {
                this.$snackbar.open({
                    message: "Invalid email format. Please fix before submitting",
                    type: "is-warning",
                    position: "is-top-right"
                });
                this.loading = false;
                return null;
            } else {
                this.$http.post('/auth/forgot', {email: this.email})
                    .then(resp => {
                        this.$snackbar.open({
                            message: `Sent a password reset link to ${this.email}`,
                            type: "is-light",
                            position: "is-top-right"
                        });
                        this.loading = false;
                        console.log(resp);
                    })
                    .catch(err => {
                        const msg = err.response.status === 500 ? err.response.data.error : "Please contact the commissioner";
                        console.log(err.response);
                        this.$snackbar.open({
                            message:`Something went wrong. ${msg}`,
                            type: "is-warning",
                            position: "is-top-right"
                        });
                        this.loading = false;
                    });
            }
        },
        submitNewPass() {
            this.loading = true;
            if(this.password !== this.repeatPass) {
                this.$snackbar.open({
                    message: "Password fields do not match. Please fix before submitting",
                    type: "is-warning",
                    position: "is-top-right"
                });
                this.loading = false;
                return null;
            } else {
                this.$http.post(`/auth/reset/${this.token}`, { password: this.password })
                    .then(resp => {
                        this.$snackbar.open({
                            message: "Your password has been reset. Logging you in automattically.",
                            type: "is-light",
                            position: "is-top-right"
                        });
                        console.log(resp);
                        this.loading = false;
                        this.successLoading = true;
                        this.loadingComplete = true;
                        this.$router.push({ name: 'login'});
                    })
                    .catch(err => {
                        const msg = err.response.status === 500 ? err.response.data.error : "Please contact the commissioner";
                        console.log(err.response);
                        this.$snackbar.open({
                            message: `Something went wrong. ${msg}`,
                            type: "is-warning",
                            position: "is-top-right"
                        });
                        this.loading = false;
                        this.errorLoading = true;
                        this.loadingComplete = true;
                        this.expiredToken = true;
                    });
            }
        }
    }
  
}
</script>

<style>

</style>
