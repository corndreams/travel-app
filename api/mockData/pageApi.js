export default {
	getBanner: ()=>{
		return{
			"code": 1,
			"data": {
			  "bannerList": [{
			    "image": "http://159.75.169.224:5500/ComfyUI_00006_.png",
			    "title": "身无彩凤双飞翼，心有灵犀一点通"
			  }, {
			    "image": "http://159.75.169.224:5500/ComfyUI_00006_.png",
			    "title": "谁念西风独自凉，萧萧黄叶闭疏窗，沉思往事立残阳"
			  }]
			},
			"msg": ""
		}
	},
	getHomeList: ()=>{
		return {
			code:1,
			data:[{
				id:1,
				title:'天坛',
				img:'',
				tag:'',
			},
			{
				id:2,
				title:'圆明园',
				img:'',
				tag:'',
			}]
		}
	}
}