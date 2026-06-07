

let baseUrl = ''

if(process.env.NODE_ENV === 'development'){
	//baseUrl = 'http://localhost:5173/api'
	baseUrl = 'https://m1.apifoxmock.com/m1/4728220-0-default/api/'
}else{
	baseUrl = 'https://m1.apifoxmock.com/m1/4728220-0-default/api/'
}

export default function http (url,data,method){
	return new Promise((resolve,reject)=>{
		uni.request({
			url: baseUrl + url,
			data,
			method,
			header:{
				'token':uni.getStorageSync('token') || ''
			},
			success: res=>{
				if(res.statusCode === 200){
					if(res.data.code === 1){
						resolve(res.data.data)
					}else{
						uni.showToast({
							title:res.data.msg?res.data.msg:'请求出错',
							icon:'none'
						})
					}
				}
			},
			fail: ()=>{
				uni.showToast({
					title:'请求异常',
					icon:'none'
				})
			}
		})
	})
}