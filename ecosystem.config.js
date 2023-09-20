module.exports = {
	apps : [
		{
			name : 'sfmc',
			script : './server/server.js',
			instances : 2,
			exec_mode : 'cluster',
			wait_ready : true,
			listen_timeout : 50000,
			kill_timeout : 5000,
			env: {
				COMMON_VARIABLE: "true",
			},
			instance_var: "INSTANCE_ID", // instance_var 설정
		}
	]
} 