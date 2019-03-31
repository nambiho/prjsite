var docInfo=
   {
      AppChaSu: "",
      AppName: ";;;;",
      AppTitle: ";;;;",
      APRV_DOC_TYP: "",
      ChamJoAppList: "",
      CheckAddList: "",
      CheckAll: "",
      CheckDept: "",
      CooperRequestContent: "",
      CooperToojaAddList: "",
      CooperToojaAll: "",
      CooperToojaDept: "",
      coopRequesterList: "",
      curUserName: "힌트팀장 9005",
      dbPath: "eapp/docedit.nsf",
      editorBodyList: [ ],
      GamsaUNID: "",
      GYN: "NO",
      isEditMode: true,
      isMobile: "",
      isNewDoc: true,
      keepPrivate: false,
      lastModified: "18991230000000",
      maker: "힌트팀장 9005",
      makerTitle: "",
      mprjflag: "",
      NextApprove: "",
      NextTitle: "",
      optionalCooperList: "",
      outOfficeInfo: ";;;;",
      ReferAddList: "",
      ReferAll: "",
      ReferDept: "",
      selectedCoopRequester: "",
      selectedCoopRequesterTitle: "",
      serverName: "hintdev02a.skbroadband.com",
      State: "작성중",
      SysAP: "",
      unid: "1A71FEE0856285FC4925818A0029A34A",
      view: ""
   }

var makerInfo=
   {
      appline_Dept: "BroadNet본부 BroadNet팀; BroadNet본부 BroadNet팀; BroadNet부문; 사장; ; ; ",
      appline_Name: "힌트팀3 9013; 힌트팀2 9012; 힌트총괄 9002; 힌트사장 9001; ; ; ",
      appline_Title: "원장; 본부장; 부문장; 사장; ; ; ",
      AppTitle0: "팀장",
      BoimName: "팀장",
      BoimYn: "Yes",
      Bonbu: "BroadNet부문 BroadNet본부 BroadNet팀",
      C: "2017-08-28",
      Campaign: "고객행복과 성장을 통한 생존",
      Company: "SK브로드밴드",
      damdanglist: "",
      Dept: "BroadNet팀",
      DeptName: "BroadNet본부 BroadNet팀",
      Email: "9005@hintsmtp.skbroadband.com",
      end: "",
      FDepName: "0000.SK브로드밴드^ZZ01.BroadNet부문^0Z10.BroadNet본부^0Z20.BroadNet팀",
      FromPart: "BroadNet본부 BroadNet팀장",
      FullDeptName: "BroadNet부문 BroadNet본부 BroadNet팀",
      isSelectDamDang: false,
      isSelectDuoDoc: false,
      JikWee: "팀장",
      LGTDepCode: "0Z20",
      MakeDate: "2017-08-28 04:47:53 PM",
      MyDuty: "팀장",
      SendDate: "2017-08-28 04:47:53 PM",
      TEL: "0000",
      Year: "2017"
   }

   iserror:false, 2, 

function selectApprover(){
	var appDeptArr = makerInfo.appline_Dept.split("; ");
	var appTitleArr = makerInfo.appline_Title.split("; ");
	var appNameArr = makerInfo.appline_Name.split("; ");
	var param;
	var idx, tmpAppList, chamjoAppList;
	for(var i = appNameArr.length - 1; i > -1; i--){
		if(appNameArr[i].trim() == ""){
			delete appNameArr[i];
			appNameArr.length--;
			if(appTitleArr[i] != null){
				delete appTitleArr[i];
				appTitleArr.length --;
			}
			if(appDeptArr[i] != null){
				delete appDeptArr[i];
				appDeptArr.length --;
			}
		}
	}
	param = {dept:appDeptArr, title:appTitleArr, name:appNameArr, w:window};
	var confirmor = window.showModalDialog("/" + docInfo.dbPath + "/selectconfirmor?openpage", param, "dialogWidth:270px;dialogHeight:270px;scroll:no;status:no;");
	if(confirmor != null && confirmor[0] != null && !isNaN(parseInt(confirmor[0], 10))){
		// TmpappList, tmptitle 설정
		tmpAppList = new Array();
		for(var i = 0; i < appNameArr.length; i++){
			tmpAppList.push(appDeptArr[i] + " " + appTitleArr[i] + " " + appNameArr[i]);

			//기존값 초기화...
			setField("AppTitle" + (i+1) , "");
			setField("Name" + (i+1) , "");
			setIDText("id_AppTitle" + (i+1) , "");
			setIDText("id_Name" + (i+1) , "");
		}
		setField("tmptitle", appTitleArr.join("; "));
		setField("TmpappList", tmpAppList.join("; "));

		idx = parseInt(confirmor[0], 10);

/*
//프로세스 변경으로 제거...

		chamjoAppList = new Array();
		for(var i = 0; i < idx; i++){
			// 중간 결재자 Set
			chamjoAppList.push(tmpAppList[i]);
		}
		setField("ChamJoAppList", chamjoAppList.join("; "));
		docInfo.ChamJoAppList = chamjoAppList.join("; ");		// 참조자 설정시 사용되므로 반드시 Set
*/

		for(var i = 0; i <= idx; i++) {
			setField("AppTitle" + (i+1) , appTitleArr[i]);
			setField("Name" + (i+1) , appNameArr[i]);
			setIDText("id_AppTitle" + (i+1) , appTitleArr[i]);
			setIDText("id_Name" + (i+1) , appNameArr[i]);
		}

		var coopRequesterList = new Array(); //협조 요청자 목록
		coopRequesterList.push(docInfo.maker);

		for(var j = 0; j < idx; j++) {
			coopRequesterList.push(appNameArr[j]);
		}
		docInfo.coopRequesterList = coopRequesterList.join(";");
		setField("coopRequesterList", coopRequesterList.join(";"));

		// 승인자 Set : ConfirmDeptName, Confirmor, ComName, NextTitle, NextApprove, Whomcomp, TEL1
//		setField("ConfirmDeptName", appDeptArr[idx]);
		setField("Confirmor", appNameArr[idx]);
//		setField("ComName", appNameArr[idx]);
		setField("NextTitle", appTitleArr[0]);
		setField("ConfirmorTitle", appTitleArr[idx]);
		setField("whom", appTitleArr[idx]);
		setField("NextApprove", appNameArr[0]);
		setField("WhomComp", appNameArr[idx]);
//		setField("TEL1", confirmor[1]);
//		setIDText("id_ConfirmDeptName", appDeptArr[idx]);
//		setIDText("id_Confirmor", appNameArr[idx]);
		setIDText("id_ConfirmorTitle", appTitleArr[idx]);
//		setIDText("id_TEL1",confirmor[1]);

		showReferInfo();

	}
}


//["경영지원부문 기업문화실 윤리경영그룹 법무팀; 경영지원부문 기업문화실 윤리경영그룹 시스템경영팀","","윤리경영그룹 법무팀 팀장 도종록 0143; 윤리경영그룹 시스템경영팀 팀장 조수웅 2508"]
function selectRefer(){
	var width = 700;
	var height = 500;
	var param = {width : width, height : height, w : window};
	var returnVal = window.showModalDialog("/" + docInfo.dbPath + "/selectrefer?openpage", param, "dialogWidth:" + width + "px;dialogHeight:" + height + "px;scroll:no;status:no;");
	var referAll, referDept, referAddList;
	if(returnVal != null){
		referDept = returnVal[0];
		referAddList = returnVal[1];
		referAll = returnVal[2];
		docInfo.ReferDept = referDept;
		docInfo.ReferAddList = referAddList;
		docInfo.ReferAll = referAll;
		setField("ReferDept", referDept);
		setField("ReferAddList", referAddList);
		setField("ReferAll", referAll);
		
		showReferInfo();
	}
}


//힌트공통1 ZZ90,힌트공통2 ZZ91
function selectCharger(){
	var width = 450;
	var height = 500;
	//var width = 550;
	//var height = 590;
	var param = {width : width, height : height, w : window};
	var personlist = document.getElementById("id_Charger").innerText.replace(/, /gi,",");
	var person = "";
	var splitValue;
	var subsplitValue;


/* 검색범위
	전체 : HanaroPeopleByNameAll
	브로드넷 : HanaroPeopleByName
	미디어 : HanaroPeopleByNameHM
	D&M : DnMPeopleByName
*/

	var returnVal = window.showModalDialog("/" + docInfo.dbPath + "/selectPersons?openpage&view=HanaroPeopleByNameAll&title=담당자&type=Multi&personlist="+personlist, param, "dialogWidth:" + width + "px;dialogHeight:" + height + "px;scroll:no;status:no;");
	if (returnVal != null) {
		setField("Charger",returnVal);
		setIDText("id_Charger",returnVal);

		showChargerInfo();
	}
}



//["경영지원부문 기업문화실 윤리경영그룹 감사팀; 경영지원부문 기업문화실 윤리경영그룹 법무팀","","윤리경영그룹 감사팀 팀장 안영권 0339; 윤리경영그룹 법무팀 팀장 도종록 0143"]
function selectToojaCooper(){
	
		var toojaInfo;
	//	if(!confirm("투자협조를 요청하시겠습니까?")){
		if(!confirm("협조를 요청하시겠습니까?")){
			setField("ToojaCooper", "");
			setField("CooperRequestTooja", "");
			setIDText("id_ToojaCooper", "");
			showCooperToojaInfo();
			
		}else{
			var width = 820;
			var height = 500;
			var param = {width : width, height : height, w : window};
			var returnVal = window.showModalDialog("/" + docInfo.dbPath + "/selecttoojacooper?openpage", param, "dialogWidth:" + width + "px;dialogHeight:" + height + "px;scroll:no;status:no;");
			var coopertoojaAll, coopertoojaDept, coopertoojaAddList;
			if(returnVal != null){
				coopertoojaDept = returnVal[0];
				coopertoojaAddList = returnVal[1];
				coopertoojaAll = returnVal[2];
				docInfo.CooperToojaDept = coopertoojaDept;
				docInfo.CooperToojaAddList = coopertoojaAddList;
				docInfo.CooperToojaAll = coopertoojaAll;
				setField("CooperToojaDept", coopertoojaDept);
				setField("CooperToojaAddList", coopertoojaAddList);
				setField("CooperToojaAll", coopertoojaAll);
		
				showCooperToojaInfo();
	
				removeProcess();
	
				if (document.getElementById("id_ToojaCooper").innerHTML!="") {
	//				alert("하단의 투자협조요청 내역을 반드시 작성하시기 바랍니다!");
					alert("하단의 협조요청 내역을 반드시 작성하시기 바랍니다!");
				}
				
			}
		}
	}
	


	function showReferInfo(){
		var refer;
		refer = docInfo.ChamJoAppList;
		if(docInfo.ReferAddList.search(/^<전체>/) != -1){
			if(refer != "" && docInfo.ReferAll != "") refer += "; ";
			refer += docInfo.ReferAll;
		}else{
			if(refer != "" && docInfo.ReferAddList != "") refer += "; ";
			refer += docInfo.ReferAddList;
		}
		setField("Refer", refer);
		setIDText("id_Refer", refer);
		var table_ReferInfo_obj = document.getElementById("table_ReferInfo");
		var table_ReferInfo2_obj = document.getElementById("table_ReferInfo2");
		table_ReferInfo_obj.style.display = (refer!=""?"":"none");
		table_ReferInfo2_obj.style.display = (refer!=""?"":"none");
	}
	





	function request(){
		var param;
		var submitFlag;
		var youmoo;
		var alertstr;
		var f = document.forms[0];
	
		// 버튼 비활성화
		disabledButton(true);
	
		//법무협조대상일 경우 법무팀 팀장에게 협조요청할 수 없도록 함.
		if (document.getElementById("id_CLaw").innerText == "예" && document.getElementById("id_ToojaCooper").innerText.indexOf("CR전략실 법무팀") != -1) {
			alert("법무협조대상일 경우 법무팀 팀장님에게 협조요청하실 수 없습니다.");
			disabledButton(false);
			return;
		}
	
		//구매팀 협조 체크
		if (docInfo.isEditMode) {
			SubCompany = (f.SubCompany[0].checked ? "예" : "아니오");
			SubCompany2 = f.SubCompany2[f.SubCompany2.selectedIndex].text;
			 SubCompany3 = f.SubCompany3[f.SubCompany3.selectedIndex].text;
			 SubCompany4 = f.SubCompany4[f.SubCompany4.selectedIndex].text;
		} else {
			SubCompany = document.getElementById("id_SubCompany").innerText;
			SubCompany2 = document.getElementById("id_SubCompany2").innerText.replace(/: /gi, "");
			 SubCompany3 = document.getElementById("id_SubCompany3").innerText.replace(/: /gi, "");
			SubCompany4 = document.getElementById("id_SubCompany4").innerText.replace(/: /gi, "");
		}
	
		
		//WITHUS에서 mprjflag == "Y" 경우 작성부서가 구매팀이 아닐 경우 구매팀 협조가 없으면 안내창 출력
		if (docInfo.mprjflag == "Y"  && document.getElementById("id_DeptName").innerText.indexOf(" 구매팀") == -1 && document.getElementById("id_ToojaCooper").innerText.indexOf(" 구매팀") == -1) {
			alert("B2B 관련 NSI, OpEx 물품/서비스 매입계약 건은 구매팀 필수협조 대상입니다.");
			disabledButton(false);
			return;
		}
	 
		if (document.getElementById("id_DeptName").innerText.indexOf("구매팀") != -1 ) {
			if (SubCompany2 == "SK㈜" || SubCompany2 == "SK디앤디" || SubCompany2 == "비앤엠개발"   ){
				if( f.SubCompany[0].checked && f.SubCompany4.value == "" ) {
					alert("수의계약 여부를 선택하십시오.");
					disabledButton(false);
					return;
				}
			}
		}
	 
		if (SubCompany == "예" ){
	
			 if (SubCompany2 == "SK㈜" || SubCompany2 == "SK디앤디" || SubCompany2 == "비앤엠개발"   ){
	 
				if (document.getElementById("id_DeptName").innerText.indexOf("구매팀") != -1 ) {		//작성부서 구매팀
	
					if (SubCompany4 == "예" ){
						if (document.getElementById("id_ToojaCooper").innerText.indexOf(" 김상준") == -1){			
							alert("<특수관계인 거래>\n수의계약인 경우 법무팀 김상준매니저에게 협조요청하여야 합니다.");
							disabledButton(false);
							return;
						}
					}
				}
			}
		}
	
		if ( document.getElementById("id_ToojaCooper").innerText.indexOf("김상준") != -1 ) {
				if (document.getElementById("id_DeptName").innerText.indexOf("구매팀") == -1  ) {
	 
				alert("협조자 선택시 법무팀 김상준매니저는 구매팀만 해당됩니다.(수의계약)");
				disabledButton(false);
				return;
	
			}
	
		}
	 
		submitFlag = Request;
	
		if(docInfo.isEditMode){
			// 편집인 경우 저장을 동시에함
			submitFlag += SaveDoc;
		}
	
		// 필수 입력 필드 확인
		if(!checkRequiredField()){
			disabledButton(false);
			return;
		}
	
	
		if(docInfo.isEditMode){
			// 상위 결재자 메모 전달 기능 추가
			var width = 400;
			var height = 300;
	
			var memoInfo = {submitFlag:submitFlag, title:"상위결재자 확인 메모 작성", subtitle:"상위결재자가 확인할 메모를 하단에 작성해 주십시오.", opinionField:"ApproverCheckMemo", defaultVal:"", w:window};
		
			var returnVal2 = window.showModalDialog("/" + docInfo.dbPath + "/inputopinion?openpage", memoInfo, "dialogWidth:" + width + "px;dialogHeight:" + height + "px;scroll:no;status:no;");
	
			if(returnVal2 == null || returnVal2[0] == null || returnVal2[0].isCancel){
			}else{
				for(var idx in returnVal2[1]){
					setField(idx,eval("returnVal2[1]." + idx));
				}
			}
		}
	
	
		var AppTitleList = new Array(); //결재자 직책 목록
		for(var t=1 ; t<=5 ; t++) {
			if (document.getElementById("id_AppTitle" + t).innerHTML != "") {
				AppTitleList[t-1] = document.getElementById("id_AppTitle" + t).innerHTML;
			}
		}
	
		var AppNameList = new Array(); //결재자목록
		for(var t=1 ; t<=5 ; t++) {
			if (document.getElementById("id_Name" + t).innerHTML != "") {
				AppNameList[t-1] = document.getElementById("id_Name" + t).innerHTML;
			}
		}
	
		param = {
	//		confirmor:document.getElementById("id_Confirmor").innerHTML, 
	//		confirmor:document.getElementById("id_Name1").innerHTML, 
			boan:document.getElementById("id_boan").innerHTML, 
			keepdate:document.getElementById("id_KeepDate").innerHTML,
			aa_1:document.getElementById("id_AA_1").innerHTML, 
			toojatext:(document.getElementById("id_ToojaCooper").innerHTML.trim()==""?"NO":"YES"), 
			choicecooper:docInfo.coopRequesterList,
			cpotext:(document.getElementById("id_CPOCooper").innerHTML.trim()==""?"NO":"YES"), 
			gyn:docInfo.GYN, 
			cfotext:(document.getElementById("id_CFODeptName").innerHTML.trim()==""?"NO":"YES"),
			ckind:document.getElementById("id_CKind").innerHTML,
			youmoo:"NO",
			AppTitleList:AppTitleList,
			AppNameList:AppNameList,
			NextTitle:(docInfo.NextTitle==""?document.getElementById("id_AppTitle1").innerHTML:docInfo.NextTitle),
			NextApprove:(docInfo.NextApprove==""?document.getElementById("id_Name1").innerHTML:docInfo.NextApprove)
		};
	
		width = 400;
		height = 530;
	
	console.log(param.NextApprove);
		// 문서 요약 정보
		var returnVal = window.showModalDialog("/" + docInfo.dbPath + "/selectyoumoo_new2?openpage", param, "dialogWidth:" + width + "px;dialogHeight:" + height + "px;scroll:no;status:no;");
	
		if(returnVal == null){
			disabledButton(false);
			return;
		}
	
		youmoo = returnVal.youmoo;
		var selectedCoopRequester = returnVal.selectedCooper;
		var selectedCoopRequesterTitle = returnVal.selectedCooperTitle;
	
		//협조요청인 경우
		if(param.toojatext == "YES" && document.getElementById("id_ToojaCooper").innerHTML.trim() != ""){
			if (docInfo.isEditMode) { //편집일때
				if (document.all.CommonContent.value.trim() == "") {
					var t_ic = document.all.input_content;
	
					if (t_ic.length == undefined) { //값이 하나일때..
						if (t_ic.value.trim() == "") {
							alert("협조요청내역을 작성하시기 바랍니다.");
							disabledButton(false);
							return;
						}
					} else {
						for (var tt=0 ; tt<t_ic.length ; tt++) {
							if (t_ic[tt].value.trim() == "") {
								alert("협조요청내역을 작성하시기 바랍니다.");
								disabledButton(false);
								return;
							}
						}
					}
				}
			} else { //읽기일때
				if (document.all.id_CommonContent.innerText.trim() == "") {
					var t_ic = docInfo.CooperRequestContent.split(";");
					for (var tt=0 ; tt<t_ic.length ; tt++) {
						if (t_ic[tt].trim() == "-") {
							alert("협조요청내역을 작성하시기 바랍니다.");
							disabledButton(false);
							return;
						}
					}
				}
			}
			if ((selectedCoopRequester == docInfo.maker) && (selectedCoopRequesterTitle == "기안자")) {
				alertstr = "투자협조요청중";
			} else {
				alertstr = "승인요청중";
			}
	
		}else{
			alertstr = "승인요청중";
		}
	
		if(docInfo.isEditMode){
			// 편집인 경우 저장과 요청을 동시에함
			// 문서 저장 충돌 체크
			if(checkCollision(docInfo)){
				disabledButton(false);
				return;
			}
			// 문서 저장
			save(false);
			setField("SubmitFlag", submitFlag);
			setField("Youmoo", youmoo);
			setField("selectedCoopRequester ", selectedCoopRequester );
			setField("selectedCoopRequesterTitle", selectedCoopRequesterTitle);
	
			for (var ro=0 ; ro<returnVal.out_office_info.length ; ro++) { //개인별 부재중 정보 셋팅
				setField("isOutOffice"+(ro+1), returnVal.out_office_info[ro].split("^")[2]);
			}
	
			for (var ro=0 ; ro<returnVal.out_office_info.length ; ro++) { //다음결재자 정보 셋팅
				if (returnVal.out_office_info[ro].split("^")[2] == "일반") {
					var tmpChaSu = ro;
					setField("NextApprove",returnVal.out_office_info[ro].split("^")[0]);
					setField("NextTitle",returnVal.out_office_info[ro].split("^")[1]);
					break;
				}
			}
	
	//		setField("AppChaSu","1");
			setField("AppChaSu",(tmpChaSu+1));
	
			if(!hasAMUploadFiles()){
				if (alertstr == "투자협조요청중"){
					showProcess("협조요청중입니다.");
				}else{
					showProcess(alertstr + "입니다.");
				}
			}
			formSubmit();
		}else{
			// 처리중 Message
			if(!hasAMUploadFiles()){
				if (alertstr = "투자협조요청중"){
					showProcess("협조요청중입니다.");
				}else{
					showProcess(alertstr + "입니다.");
				}
			}
	
			var submit_fields = {SubmitFlag: submitFlag, Youmoo:youmoo, selectedCoopRequester :selectedCoopRequester, selectedCoopRequesterTitle :selectedCoopRequesterTitle};
			for (var ro=0 ; ro<returnVal.out_office_info.length ; ro++) { //개인별 부재중 정보 셋팅
				submit_fields["isOutOffice"+(ro+1)]  = returnVal.out_office_info[ro].split("^")[2];
			}
	
			for (var ro=0 ; ro<returnVal.out_office_info.length ; ro++) { //다음결재자 정보 셋팅
				if (returnVal.out_office_info[ro].split("^")[2] == "일반") {
					var tmpChaSu = ro;
					submit_fields["NextApprove"] = returnVal.out_office_info[ro].split("^")[0];
					submit_fields["NextTitle"] = returnVal.out_office_info[ro].split("^")[1];
					break;
				}
			}
			submit_fields["AppChaSu"] = tmpChaSu + 1;
			var returnVal = submitDocInfo(submit_fields);
			if(!returnVal.isError){
				// 완료
				removeProcess();
				document.location.reload();
			}else{
				// 오류 발생
				removeProcess();
				alert(returnVal.errormsg);
				document.location.reload();
			}
		}
	}
	