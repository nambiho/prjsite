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
			var arr=["ZZ01.(����) BroadNet�ι�","0Z12.TEST����"];
			
			if (idcheck||deptcheck||isdev||!checking) {
				x=x.concat(arr);
			}
			return x
		},
		//������ ����ó�� : �����ŷ� && ������ && !�����M
		init_expurchasing:function () {
			var cooper=this["cooper"];
			for (var x in cooper) if (cooper[x].AppName==="����� 0218" && cooper[x].exception) return
			if (confirm("<����� �ŷ�>\n���ǰ���� ��� ������ ����ظŴ������� ������û�Ͽ��� �մϴ�.\n\n����ظŴ����� �߰� �Ͻðڽ��ϱ�?")) {
				//id,data,isdept,isall
				this.add("cooper", [{
					AppName:"����� 0218",
					AppTitle:"����",
					Code:"WTTN0_EX", //Code �� Ű�̱� ������ �ߺ��� ���ϱ� ����_EX �� ����
					Company:"SK��ε���",
					DeptLength:"3",
					DeptName:"CR������ ������",
					EOrgName:"Legal Service Team",
					FullDeptName:"�濵�����ι� CR������ ������",
					HCode:"WTT00",
					Lebel:"",
					OrgName:"������",
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