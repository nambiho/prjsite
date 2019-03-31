;(function (realm) {
	var orgexcept={
		changeCode:function (x) {
			var expt={"0006":"00061"};
			return expt[x]||x
		},
		hideCheckbox:function (entry) {
			var ret=
				entry.Lebel==="X"
				||entry.Code==="A0000"
			;
			return ret
		},
		hideDept:function (code) {
			if (location.host.indexOf("hintdev")!=-1) return true;
			var deptcheck=(testCode.indexOf(code)!=-1);
			return !deptcheck;
		},
		addRoot:function (x,checking) {
			var idcheck=([""].indexOf(checking)!=-1);
			var isdev=(location.host.indexOf("hintdev")!=-1);
			var deptcheck=("ZZ01 ZZ02 0Z05 0Z10 0Z12 0Z20".indexOf(checking)!=-1);
			var arr=["ZZ01.(개발) BroadNet부문","0Z12.TEST본부"];
			
			if (idcheck||deptcheck||isdev||!checking) {
				x=x.concat(arr);
			}
			return x
		},
		//구매팀 예외처리 : 관계사거래 && 구매팀 && !김상준M
		init_expurchasing:function () {
			var cooper=this["cooper"];
			for (var x in cooper) if (cooper[x].AppName==="김상준 0218" && cooper[x].exception) return
			if (confirm("<관계사 거래>\n수의계약인 경우 법무팀 김상준매니저에게 협조요청하여야 합니다.\n\n김상준매니저를 추가 하시겠습니까?")) {
				//id,data,isdept,isall
				this.add("cooper", [{
					AppName:"김상준 0218",
					AppTitle:"팀원",
					Code:"WTTN0_EX", //Code 가 키이기 때문에 중복을 피하기 위해_EX 를 붙임
					Company:"SK브로드밴드",
					DeptLength:"3",
					DeptName:"CR전략실 법무팀",
					EOrgName:"Legal Service Team",
					FullDeptName:"경영지원부문 CR전략실 법무팀",
					HCode:"WTT00",
					Lebel:"",
					OrgName:"법무팀",
					SCode:"",
					Type:"G",
					position:"1",
					response:false,
					sort:"",
					unid:"DB6D23057537AB9C4925814F003842CD",
					exception:true
				}], true, false);
			}
		}
	}
	realm.orgexcept||(realm.orgexcept=orgexcept);
} (this));