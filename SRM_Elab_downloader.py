USERNAME = "REGISTERNO" # replace here
PASSWORD = "PASSWORD" # replace here
ELAB = "os" 

# replace above ELAB with : (don't remove the quotes)

# computingskill_c (for c)
# computingskill_cpp (for c++)
# computingskill_java (for java)
# computingskill_ds (for data structure)
# computingskill_ml (for mathslab)
# computingskill_py (for python)
# os (for os)
# java, java2 or ada

!pip3 install img2pdf

import requests
import os as operatingsystem
import img2pdf

def gen_report(username, password, elabx, level):

	computingskill_c = {'url': 'http://care.srmuniv.ac.in/computingskill/', 'code': 'c/c.code.php', 'key': 'c'}
	computingskill_cpp = {'url': 'http://care.srmuniv.ac.in/computingskill/', 'code': 'cpp/cpp.code.php', 'key': 'CPP'}
	computingskill_java = {'url': 'http://care.srmuniv.ac.in/computingskill/', 'code': 'java/java.code.php', 'key': 'JAVA'}
	computingskill_ds = {'url': 'http://care.srmuniv.ac.in/computingskill/', 'code': 'data-structure/data-structure.code.php', 'key': 'DATA-STRUCTURE'}
	computingskill_ml = {'url': 'http://care.srmuniv.ac.in/computingskill/', 'code': 'mathslab/mathslab.code.php', 'key': 'MATHSLAB'}
	computingskill_py = {'url': 'http://care.srmuniv.ac.in/computingskill/', 'code': 'python/python.code.php', 'key': 'PYTHON'}
	java = {'url': 'http://care.srmuniv.ac.in/ktrcsejava/', 'code': 'java/java.code.php', 'key': 'java'}
	java2 = {'url': 'http://care.srmuniv.ac.in/ktrcsejava2/', 'code': 'java/java.code.php', 'key': 'java'}
	ada = {'url': 'http://care.srmuniv.ac.in/ktrcseada/', 'code': 'daa/daa.code.php', 'key': 'daa'}
	pdd = {'url': 'http://care.srmuniv.ac.in/ktrcsepdd/', 'code': 'c/c.code.php', 'key': 'c'}
	it_ada = {'url': 'http://care1.srmuniv.ac.in/ktritada/', 'code': 'daa/daa.code.php', 'key': 'daa'}
	it_java = {'url': 'http://care1.srmuniv.ac.in/ktritjava/', 'code': 'java/java.code.php', 'key': 'java'}
	os = {'url': 'http://care.srmuniv.ac.in/ktrstudentskill/', 'code': 'operating-systems/operating-systems.code.php', 'key': 'operating-systems'}

	if(elabx == 'computingskill_c'):
		elab = computingskill_c
	elif(elabx == 'computingskill_cpp'):
		elab = computingskill_cpp
	elif(elabx == 'computingskill_java'):
		elab = computingskill_java
	elif(elabx == 'computingskill_ds'):
		elab = computingskill_ds
	elif(elabx == 'computingskill_ml'):
		elab = computingskill_ml
	elif(elabx == 'computingskill_py'):
		elab = computingskill_py
	elif(elabx == 'java'):
		elab = java
	elif(elabx == 'java2'):
		elab = java2
	elif(elabx == 'ada'):
		elab = ada
	elif(elabx == 'it_java'):
		elab = it_java
	elif(elabx == 'it_ada'):
		elab = it_ada
	elif(elabx == 'pdd'):
		elab = pdd
	elif(elabx == 'os'):
		elab = os
	else:
		return
	
	login_page = elab['url'] + 'index.helper.php'
	home_page = elab['url'] + 'login/studentnew/home.php'
	question_page = elab['url'] + 'login/studentnew/code/' + elab['code'] + '?id=' + level + '&value='
	
	payload = {
		'userid': username,
		'password': password
	}
	
	print('eLab Report Generator : ' + payload['userid'])
	
	with requests.Session() as s:
	
		# login page
	
		s.post(login_page, data=payload)
	
	
		# home page
	
		s.get(home_page)
	
	
		# question page requests & responses
	
		s.get(elab['url'] + 'login/studentnew/question.php')
		s.post(elab['url'] + 'login/studentnew/home.helper.php', data={'text': elab['key'].upper()})
		s.get(elab['url'] + 'login/studentnew/question.php')
		s.get(elab['url'] + 'login/studentnew/question.list.js')
		s.post(elab['url'] + 'login/studentnew/course.get.php', data={'q': 'SESSION'})
		s.post(elab['url'] + 'login/studentnew/course.get.php', data={'q': 'VALUES'})
	
	
		# individual question -> code page
	
		s.get(elab['url'] + 'login/studentnew/code/' + elab['code'] + '?id=' + level + '&value=0')
		s.get(elab['url'] + 'Code-mirror/lib/codemirror.js')
		s.get(elab['url'] + 'Code-mirror/mode/clike/clike.js')
		s.get(elab['url'] + 'login/studentnew/code/' + elab['key'] + '/code.elab.js')
		s.post(elab['url'] + 'login/studentnew/code/code.get.php')
		s.post(elab['url'] + 'login/studentnew/code/flag.checker.php')
	
	
		# get the code, evaluate it and download the report (if 100%)
		
		i = 0

		while i < 100:
	
			present_question = question_page + str(i)
			s.get(present_question)

			if(s.get(present_question).text.find('NOT ALLOCATED')==-1):
				code = s.get(elab['url'] + 'login/studentnew/code/code.get.php')

				if(code.text != ''):
		
					if(elab['key'] == 'daa'):
			
							evaluate_payload_c = s.post(elab['url'] + 'login/studentnew/code/' + elab['key'] + '/code.evaluate.elab.php', data={'code': code.text, 'input': '', 'language': 'c'})
							evaluate_payload_cpp = s.post(elab['url'] + 'login/studentnew/code/' + elab['key'] + '/code.evaluate.elab.php', data={'code': code.text, 'input': '', 'language': 'cpp'})
							evaluate_payload_java = s.post(elab['url'] + 'login/studentnew/code/' + elab['key'] + '/code.evaluate.elab.php', data={'code': code.text, 'input': '', 'language': 'java'})
							evaluate_payload_python = s.post(elab['url'] + 'login/studentnew/code/' + elab['key'] + '/code.evaluate.elab.php', data={'code': code.text, 'input': '', 'language': 'python'})
							evaluate_payload_mathslab = s.post(elab['url'] + 'login/studentnew/code/' + elab['key'] + '/code.evaluate.elab.php', data={'code': code.text, 'input': '', 'language': 'mathslab'})
		
							if '100' in [evaluate_payload_c.text[-4:-1], evaluate_payload_cpp.text[-4:-1], evaluate_payload_java.text[-4:-1], evaluate_payload_python.text[-4:-1], evaluate_payload_mathslab[-4:-1]]:
								complete_percent = '100'
							else:
								complete_percent = '0'
			
					else:
						evaluate_payload = s.post(elab['url'] + 'login/studentnew/code/' + elab['key'] + '/code.evaluate.elab.php', data={'code': code.text, 'input': '', 'language': 'cpp'})
						try:
							complete_percent = str(evaluate_payload.json()['score'])
						except:
							complete_percent = str(0)
		
				
		
					if(complete_percent == '100'):
			
						print(str(i + 1) + ' : getting report')
						file = s.get(elab['url'] + 'login/studentnew/code/getReport.php')
		
						with open(payload['userid'] + '-' + str(i).zfill(3) + '.png', 'wb') as f:
							f.write(file.content)
			
					else:

						if elab['key'] == 'java':

							if evaluate_payload.text.lower().find('score')==-1 and evaluate_payload.text.lower().find('exception')==-1 and evaluate_payload.text.lower()[60:].find('error')==-1:
								print(str(i + 1) + ' : Error... Trying again')
								i-=1
						
						else:
							print(str(i + 1) + ' : evaluation error : Couldn\'t get report')
		
				else:		
					print(str(i + 1) + ' : No code written')

			else:
				print(str(i + 1) + ' : Question not allocated')
			i+=1


		# put all the images to PDF
	
		filename = payload['userid'] + '-' + elabx.upper() + '-Level-' + level + '.pdf'
		with open(filename, "ab") as f:
			f.write(img2pdf.convert([i for i in sorted(operatingsystem.listdir('.')) if i.endswith('.png')]))
	
		print('PDF file named ' + filename + ' generated')
	

		# remove the image files
	
		for i in range(0, 100):
			if(operatingsystem.path.isfile(payload['userid'] + '-' + str(i).zfill(3) + '.png')):
				operatingsystem.remove(payload['userid'] + '-' + str(i).zfill(3) + '.png')
	
		print('Image files cleared')
	
	
filename = 'dummy'    
gen_report(USERNAME, PASSWORD, ELAB, '1')