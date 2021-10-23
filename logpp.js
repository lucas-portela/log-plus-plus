/**
                                                    
		    _/          _/_/      _/_/_/      _/          _/  
		   _/        _/    _/  _/            _/          _/   
		  _/        _/    _/  _/  _/_/  _/_/_/_/_/  _/_/_/_/_/
		 _/        _/    _/  _/    _/      _/          _/     
		_/_/_/_/    _/_/      _/_/_/      _/          _/       
	
	LOG++
	Autor:Lucas Santana do Nascimento Portela
	v:16
	Data: 07/02/2015
**/

var VARIAVEL=0;
var TERMO_COMPOSTO=1;
var FATO=1;
var REGRA=0;
var counter=0;

var id=0;

var global={};

function Id()
{
	uuid=id;
	id++;
	return uuid;
}
function Recuo()
{
	this.estado_atual=[];
	this.vincular=function(variavel,referencia)
	{
		variavel.vincular(referencia);
		this.estado_atual.push(variavel);
	}
	this.recuar=function()
	{
		if(this.estado_atual.length==0)return false;
		for(var i=0;i<this.estado_atual.length;i++)
		{
			this.estado_atual[i].desvincular();
		}
		return true;
	}
	this.Unificar=function(a,b)
	{
		var mods=new Recuo();
		if(a.tipo==VARIAVEL)
		{
			if(a.nome=="_")return true;
			if(!a.vinculado())
			{
				this.vincular(a,b);
				return true;
			}
			else
			{
				var res=mods.Unificar(a.vinculo(),b);
				if(!res)
				{
					return false;
				}
				else
				{
					this.estado_atual=this.estado_atual.concat(mods.estado_atual);
					return true;
				}
			}
		}
		else if(b.tipo==VARIAVEL)
		{
			if(b.nome=="_")return true;
			if(!b.vinculado())
			{
				this.vincular(b,a);
				return true;
			}
			else
			{
				var res=mods.Unificar(b.vinculo(),a);
				if(!res)
				{
					return false;
				}
				else
				{
					this.estado_atual=this.estado_atual.concat(mods.estado_atual);
					return true;
				}
			}
		}
		else if(a.tipo==TERMO_COMPOSTO&&b.tipo==TERMO_COMPOSTO)
		{
			if(b.operadorLista!=-1&&a.subtipoiguallista()){
				var c=a;
				a=b;
				b=c;
			}
			if(a.operadorLista!=-1&&b.subtipoiguallista()){
				var cabecaA=a.parametros[0];
				var caudaA=a.parametros[1];
				var cabecaB=b.parametros[0];
				var caudaB=b.parametros[1];
				for(var i=0;i<=a.operadorLista;i++){
					var res=mods.Unificar(cabecaA,cabecaB);
					if(!res){
						mods.recuar();
						return false;
					}
					if(i+1<=a.operadorLista){
						cabecaA=caudaA.parametros[0];
						caudaA=caudaA.parametros[1];
						cabecaB=caudaB.parametros[0];
						caudaB=caudaB.parametros[1];
					}
				}
				var res=mods.Unificar(caudaA.parametros[0],caudaB);
				if(!res){
					mods.recuar();
					return false;
				}
				return true;
				
			}
			if(a.aridade==b.aridade&&a.funtor==b.funtor)
			{
				for(var i=0;i<a.aridade;i++)
				{
					var res=mods.Unificar(a.parametros[i],b.parametros[i]);
					if(!res)
					{
						mods.recuar();
						return false;
					}
				}
				this.estado_atual=this.estado_atual.concat(mods.estado_atual);
				return true;
			}
		}
		return false;
	}
}

function InterfaceProlog(termo,executar)
{
	this.termo=termo;
	this.parametros=this.termo.parametros;
	this.executar=executar;
	this.clone=function()
	{
		this.termo=termo.clone();
		this.parametros=this.termo.parametros;
		return this.termo;
	}
}

function evalExp(Exp)
{
	if(Exp.tipo==VARIAVEL)
	{
		Exp=Exp.vinculo();
		if(Exp.tipo==VARIAVEL)return {s:false,r:0}; 
	}
	if(Exp.funtor=='+')
	{
		var a=evalExp(Exp.parametros[0],evalExp);
		var b=evalExp(Exp.parametros[1],evalExp);
		if(a.s&&b.s)return {s:true,r:a.r+b.r};
		return {s:false,r:0};
	}
	else if(Exp.funtor=='-')
	{
		var a=evalExp(Exp.parametros[0],evalExp);
		var b=evalExp(Exp.parametros[1],evalExp);
		if(a.s&&b.s)return {s:true,r:a.r-b.r};
		return {s:false,r:0};
	}
	else if(Exp.funtor=='*')
	{
		var a=evalExp(Exp.parametros[0],evalExp);
		var b=evalExp(Exp.parametros[1],evalExp);
		if(a.s&&b.s)return {s:true,r:a.r*b.r};
		return {s:false,r:0};
	}
	else if(Exp.funtor=='/')
	{
		var a=evalExp(Exp.parametros[0],evalExp);
		var b=evalExp(Exp.parametros[1],evalExp);
		if(a.s&&b.s)return {s:true,r:a.r/b.r};
		return {s:false,r:0};
	}
	else if(Exp.funtor=='sen')
	{
		var a=evalExp(Exp.parametros[0],evalExp);
		if(a.s)return {s:true,r:Math.sin(a.r)};
		return {s:false,r:0};
	}
	else if(Exp.funtor=='cos')
	{
		var a=evalExp(Exp.parametros[0],evalExp);
		if(a.s)return {s:true,r:Math.cos(a.r)};
		return {s:false,r:0};
	}
	else if(Exp.funtor=='sqrt')
	{
		var a=evalExp(Exp.parametros[0],evalExp);
		if(a.s)return {s:true,r:Math.sqrt(a.r)};
		return {s:false,r:0};
	}
	else
	{
		if(isNaN(Exp.funtor))return {s:false,r:0};
		return {s:true,r:parseFloat(Exp.funtor)};
	}
}

function Provador(banco_fatos,consulta,interface_prolog)
{
	this.p=0;
	if(banco_fatos.length!=undefined)this.banco_fatos=banco_fatos;
	else this.banco_fatos=[banco_fatos];
	this.backtracking=new Recuo();
	if(interface_prolog!=undefined)this.interface_prolog=interface_prolog;
	else this.interface_prolog=[];
	this.interface_prolog=this.interface_prolog.concat([
	 	new InterfaceProlog(new TermoComposto('fail'),function()
		{
			return false;
		}),
		new InterfaceProlog(new TermoComposto('false'),function()
		{
			return false;
		}),
		new InterfaceProlog(new TermoComposto('true'),function()
		{
			return true;
		}),
		new InterfaceProlog(new TermoComposto('call',[new Variavel('X')]),function()
		{
			var X=this.parametros[0];
			if(X.vinculado())
			{
				var p=new Provador(this.banco_fatos,X.vinculo(),this.interface_prolog);
				var pres=p.Provar();
				this.backtracking.estado_atual=this.backtracking.estado_atual.concat(p.backtracking.estado_atual);
				return pres;
			}
			return true;
		}),
		new InterfaceProlog(new TermoComposto('js',[new Variavel('X')]),function()
		{
			var X=this.parametros[0];
			if(X.vinculado())
			{
				eval(X.vinculo()+"");
			}
			return true;
		}),
		new InterfaceProlog(new TermoComposto('not',[new Variavel('X')]),function()
		{
			var X=this.parametros[0];
			if(X.vinculado())
			{
				var p=new Provador(this.banco_fatos,X.vinculo(),this.interface_prolog);
				var pres=p.Provar();
				this.backtracking.estado_atual=this.backtracking.estado_atual.concat(p.backtracking.estado_atual);
				return !pres;
			}
		}),
		new InterfaceProlog(new TermoComposto('=',[X=new Variavel('X'),X]),function(){return true;}),
		new InterfaceProlog(new TermoComposto('is',[new Variavel('X'),new Variavel('Y')]),function()
		{
			var X=this.parametros[0];
			var Y=this.parametros[1];
			var y=evalExp(Y);
			if(y.s)return this.backtracking.Unificar(X,new TermoComposto(y.r));
			return false;
		}),
		new InterfaceProlog(new TermoComposto('<',[new Variavel('X'),new Variavel('Y')]),function()
		{
			var X=this.parametros[0];
			var Y=this.parametros[1];
			var x=evalExp(X);
			var y=evalExp(Y);
			if(x.s&&y.s)return x.r<y.r;
			return false;
		}),
		new InterfaceProlog(new TermoComposto('>',[new Variavel('X'),new Variavel('Y')]),function()
		{
			var X=this.parametros[0];
			var Y=this.parametros[1];
			var x=evalExp(X);
			var y=evalExp(Y);
			if(x.s&&y.s)return x.r>y.r;
			return false;
		}),
		new InterfaceProlog(new TermoComposto('>=',[new Variavel('X'),new Variavel('Y')]),function()
		{
			var X=this.parametros[0];
			var Y=this.parametros[1];
			var x=evalExp(X);
			var y=evalExp(Y);
			if(x.s&&y.s)return x.r>=y.r;
			return false;
		})
	]);
	for(var i=0;i<this.interface_prolog.length;i++)
	{
		this.interface_prolog[i].backtracking=this.backtracking;
		this.interface_prolog[i].banco_fatos=this.banco_fatos;
		this.interface_prolog[i].interface_prolog=this.interface_prolog;
	}
	this.consulta=consulta;
	this.tipo=FATO;
	if(this.consulta.length!=undefined)
	{
		this.fato=new TermoComposto("",[],this.consulta);
		var variaveis=new VariaveisEscopo(this.fato);
		variaveis.normalizar();
		this.tipo=REGRA;
	}
	else if(this.consulta.tipo==VARIAVEL)this.consulta=this.consulta.vinculo();
	this.sucesso=false;
	this.i=0;
	this.s=0;
	this.continuar=false;
	this.cut=-1;
	this.resolucoes=[];
	this.Provar=function()
	{
		this.sucesso=this._Provar();
		return this.sucesso;
	}
	this.recuar=function()
	{
		this.backtracking.recuar();
	}
	this.TentarInterface=function()
	{
		for(var i=0;i<this.interface_prolog.length;i++)
		{
			var clone=this.interface_prolog[i].clone();
			if(this.backtracking.Unificar(this.consulta,clone))
			{
				var retv=this.interface_prolog[i].executar();
				return {encontrou:true,res:retv};
			}
		}
		return {encontrou:false,res:retv};
	}
	this._Provar=function()
	{
		if(this.tipo==FATO)
		{
			if(this.consulta.tipo==VARIAVEL)return true;
			if(this.tentativaInterface==undefined)this.tentativaInterface=this.TentarInterface();
			if(this.tentativaInterface.encontrou&&!this.sucesso)return this.tentativaInterface.res;
			else if(this.tentativaInterface.encontrou&&this.sucesso)return false;
			
			if(this.p>=this.banco_fatos.length)return false;
			if(!this.continuar)
			{
				if(this.sucesso)
				{
					this.recuar();
				}
				while(true)
				{
					if(this.p>=this.banco_fatos.length)return false;
					this.fato=this.banco_fatos[this.p].clone();
					var res=this.backtracking.Unificar(this.consulta,this.fato);
					if(res)break;
					this.p++;
				}
			}
		}
		while(this.i<this.fato.regras.length)
		{
			switch(this.s)
			{
				case 0:
					if(this.fato.regras[this.i].funtor=="!")
					{
						this.cut=this.i;
						this.resolucoes[this.i]={Provar:function(){return true;},recuar:function(){}};
					}
					else
					{
						this.resolucoes[this.i]=new Provador(this.banco_fatos,this.fato.regras[this.i],this.interface_prolog);
					}
					this.s=1;
					break;
				case 1:
					if(this.resolucoes[this.i].Provar())
					{
						if(this.i>=this.fato.regras.length-1)
						{
							if(this.i==this.cut)
							{
								this.p++;
								this.continuar=false;
								return true;
							}
							this.continuar=true;
							return true;
						}
						else
						{
							this.s=0;
							this.i++;
						}
					}
					else
					{
						if(this.i==0)
						{
							if(this.tipo==FATO)
							{
								this.p++;
								this.s=0;
								this.recuar();
								this.continuar=false;
								return this.Provar();
							}
							else
							{
								this.recuar();
								this.continuar=false;
								return false;
							}
						}
						else if(this.i==(this.cut+1))
						{
							this.recuar();
							this.continuar=false;
							return false;
						}
						this.resolucoes[this.i].recuar();
						this.i--;
					}
					break;
			}
		}
		this.p++;
		this.continuar=false;
		return true;
	}
}

function Variavel(nome)
{
	if(nome==undefined)nome="_LS"+Id();
	this.tipo=VARIAVEL;
	this.nome=nome;
	this.referencia=this;
	this.vinculadaOcupado=false;
	this.vinculoOcupado=false;
	this.vincularOcupado=false;
	this.vincular=function(ref)
	{
		if(this.vincularOcupado)return;
		this.vincularOcupado=true;
		if(!this.vinculado())this.referencia=ref;
		else
		{
			if(this.vinculo().tipo==VARIAVEL)this.vinculo().vincular(ref);
			else
			{
				this.referencia=ref;
			}
		}
		this.vincularOcupado=false;
	}
	this.desvincular=function(){this.referencia=this;}
	this.vinculada=function()
	{
		if(this.vinculadaOcupado)return false;
		if(this.referencia!=this)
		{
			if(this.referencia.tipo==VARIAVEL){
				this.vinculadaOcupado=true;
				var vncda=this.referencia.vinculada();
				this.vinculadaOcupado=false;
				return vncda;
			}
			else return true;
		}
		else return false;
	}
	this.vinculado=this.vinculada;
	this.vinculo=function()
	{
		if(this.vinculoOcupado)return this;
		if(this.referencia.tipo==VARIAVEL)
		{
			this.vinculoOcupado=true;
			var vnc=this.referencia.vinculo();
			this.vinculoOcupado=false;
			return vnc;
		}
		else
		{
			return this.referencia;
		}
	}
	this.toString=function(){return this.nome;}
}

function VariaveisEscopo(termo)
{
	this.variaveis=[];
	for(var i=0;i<termo.parametros.length;i++)
	{
		if(termo.parametros[i].tipo==VARIAVEL)this.variaveis.push({container:termo.parametros,index:i});
		else
		{
			this.variaveis=this.variaveis.concat((new VariaveisEscopo(termo.parametros[i])).variaveis);
		}
	}
	for(var i=0;i<termo.regras.length;i++)
	{
		if(termo.regras[i].tipo==VARIAVEL)this.variaveis.push({container:termo.regras,index:i});
		else
		{
			this.variaveis=this.variaveis.concat((new VariaveisEscopo(termo.regras[i])).variaveis);
		}
	}
	this.length=this.variaveis.length;
	this.normalizar=function()
	{
		var trilha=[];
		var vars=[];
		for(var i=0;i<this.length;i++)
		{
			if(trilha.indexOf(this.at(i))==-1)
			{
				var v=this.at(i);
				trilha.push(v);
				this.substituir(v,v);
				vars.push(this.variaveis[i]);
			}
		}
		this.variaveis=vars;
		this.length=this.variaveis.length;
	}
	this.substituir=function(variavel,novavar)
	{
		for(var i=0;i<this.variaveis.length;i++)
		{
			if(this.variaveis[i].container[this.variaveis[i].index].nome==variavel.nome)
			{
				this.variaveis[i].container[this.variaveis[i].index]=novavar;
			}
		}
	}
	this.at=function(index)
	{
		return this.variaveis[index].container[this.variaveis[index].index];
	}
}

function TermoComposto(funtor,parametros,regras)
{
	this.tipo=TERMO_COMPOSTO;
	if(!parametros)parametros=[];
	if(!regras)regras=[];
	this.funtor=funtor+"";
	this.parametros=parametros;
	this.aridade=parametros.length;
	this.regras=regras;
	this.operadorLista=-1;
	this.clone=function()
	{
		var clone=this.nova_instancia();
		var variaveis=new VariaveisEscopo(clone);
		var trilha=[];
		for(var i=0;i<variaveis.length;i++)
		{
			if(trilha.indexOf(variaveis.at(i))==-1)
			{
				var v=variaveis.at(i);
				trilha.push(v);
				if(v.nome!="_")variaveis.substituir(v,new Variavel());
			}
		}
		return clone;
	}
	this.nova_instancia=function()
	{
		var copia=new TermoComposto(this.funtor);
		var trilha=[];
		var novas_instancias=[];
		for(var i=0;i<this.parametros.length;i++)
		{
			if(this.parametros[i].tipo==VARIAVEL)copia.parametros.push(this.parametros[i]);
			else
			{
				var iof=trilha.indexOf(this.parametros[i]);
				if(trilha.indexOf(this.parametros[i])==-1)
				{
					var inst=this.parametros[i];
					trilha.push(inst);
					var ni=inst.nova_instancia();
					novas_instancias.push(ni);
					copia.parametros.push(ni);
				}
				else
				{
					copia.parametros.push(novas_instancias[iof]);
				}
			}
		}
		for(var i=0;i<this.regras.length;i++)
		{
			if(this.regras[i].tipo==VARIAVEL)copia.regras.push(this.regras[i]);
			else
			{
				var iof=trilha.indexOf(this.regras[i]);
				if(trilha.indexOf(this.regras[i])==-1)
				{
					var inst=this.regras[i];
					trilha.push(inst);
					var ni=inst.nova_instancia();
					novas_instancias.push(ni);
					copia.regras.push(ni);
				}
				else
				{
					copia.regras.push(novas_instancias[iof]);
				}
			}
		}
		copia.aridade=this.aridade;
		return copia;
		
	}
	this.subtipoiguallista=function()
	{
		return (this.operadorLista!=-1||this.funtor=="[]"||(this.aridade==2&&this.funtor=="'.'"&&(this.parametros[1].tipo==VARIAVEL||this.parametros[1].funtor=="[]"||this.parametros[1].subtipoiguallista())));
	}
	this.toString=function()
	{
		var str;
		if(this.subtipoiguallista())
		{
			if(this.funtor=="[]")return "[]";
			str="[";
			var cabeca=this.parametros[0];
			var cauda=this.parametros[1];
			if(this.operadorLista!=-1){
				for(var i=0;i<=this.operadorLista;i++){
					str+=cabeca;
					if(i+1<=this.operadorLista){
						str+=",";
					}
					cabeca=cauda.parametros[0];
					cauda=cauda.parametros[1];
				}
				str+="|";
				while(true){
					str+=cabeca.toString();
					if(cauda.funtor=="[]")break;
					str+=",";
					cabeca=cauda.parametros[0];
					cauda=cauda.parametros[1];
				}
			}
			else while(true)
			{
				str+=cabeca.toString();
				if(cauda.funtor=="[]")break;
				str+=",";
				cabeca=cauda.parametros[0];
				cauda=cauda.parametros[1];
			}
			str+="]";
			return str;
			
		}
		str=this.funtor;
		if(this.parametros.length>0)str+="(";
		for(var i=0;i<this.parametros.length;i++)
		{
			if(this.parametros[i].tipo==VARIAVEL)str+=this.parametros[i].vinculo();
			else str+=this.parametros[i];
			if(i<this.parametros.length-1)str+=",";
		}
		if(this.parametros.length>0)str+=")";
		if(this.regras.length>0)str+=":- ";
		for(var i=0;i<this.regras.length;i++)
		{
			str+=this.regras[i];
			if(i<this.regras.length-1)str+=", ";
		}
		return str;
	}
}

function Parse(termo,naoPadronizarInstancias)
{
	var s=0;
	var i=0;
	var str="";
	var nivel={comentario:0};
	var estrutura;
	var termos=[];
	var A='A'.charCodeAt(0);
	var Z='Z'.charCodeAt(0);
	while(i<termo.length)
	{
		var c=termo.charAt(i);
		if(s!=24&&s!=25&&s!=15&&s!=16&&c=='%'){nivel.comentario=1;}
		if(s!=24&&s!=25&&s!=15&&s!=16&&c=='/'&&termo.charAt(i+1)=="*"){nivel.comentario=2;}
		if(nivel.comentario==1){
			if(c=="\n"||c=="\r\n")nivel.comentario=false;
			i++;
		}
		else if(nivel.comentario==2){
			if(c=="*"&&i<termo.length+1&&termo.charAt(i+1)=="/"){nivel.comentario=false;i++;}
			i++;
		}
		else switch(s)
		{
			case 0:
				if(c!=" "&&c!="\n"&&c!="\r\n"&&c!="\t")s=1;
				else i++;
				break;
			case 1:
				if(c==" ")s=2;
				else if(c=='\''){s=15;i++;nivel.estadoAnterior=1;}
				else if(((c=="."||c==",")&&isNaN(str))||i==termo.length-1)s=3;
				else if(c==":")s=14;
				else if(c=="["){s=17;i++}
				else if(c=="\""){s=25;i++;}
				else if(c=="("){s=4;i++;}
				else
				{
					if(c!="\n"&&c!="\r\n")str+=c;
					i++;
				}
				break;
			case 2:
				if((c=="."||c==",")||i==termo.length-1)s=3;
				else if(c==":")s=14;
				else if(c=="("){s=4;i++;}
				else i++;
				break;
			case 3:
				if(c!="."&&c!=","&&c!=" "&&c!="\n"&&c!="\r\n"&&c!="\t"&&c!='\'')str+=c;
				var firstChar=str.charCodeAt(0);
				if((c!='\''&&firstChar>=A&&firstChar<=Z)||str=="_")termos.push(new Variavel(str));
				else if(str!="")termos.push(new TermoComposto(str));
				str="";
				s=0;
				i++;
				break;
			case 4:
				estrutura=new TermoComposto(str);
				str="";
				s=5;
				nivel.parenteses=0;
				nivel.colchetes=0;
				break;
			case 5:
				if(c=="("){nivel.parenteses++;str+=c;i++;}
				else if(c=="["){nivel.colchetes++;str+=c;i++;}
				else if(c=="]"){nivel.colchetes--;str+=c;i++;}
				else if(c==")"&&nivel.parenteses>0){nivel.parenteses--;str+=c;i++;}
				else if(c==")"&&nivel.parenteses==0){s=7;}
				else if(c==","&&nivel.parenteses==0&&nivel.colchetes==0){s=6;i++;}
				else if(c=="\""){s=24;str+=c;i++;nivel.estadoAnterior=5;}
				else if(c=='\''){s=16;str+=c;i++;nivel.estadoAnterior=5;}
				else
				{
					if(c!="\n"&&c!="\r\n"&&c!=" "&&c!="\t")str+=c;
					i++;
				}
				break;
			case 6:
				estrutura.parametros.push(Parse(str,true));
				str="";
				s=5;
				break;
			case 7:
				estrutura.parametros.push(Parse(str,true));
				estrutura.aridade=estrutura.parametros.length;
				str="";
				s=8;
				break;
			case 8:
				if((c=="."||c==",")||i==termo.length-1)
				{
					termos.push(estrutura);
					s=0;
				}
				else if(c==":")s=9;
				i++;
				break;
			case 9:
				if(c=="-")s=10;
				i++;
				break;
			case 10:
				str="";
				nivel.parenteses=0;
				nivel.colchetes=0;
				s=11;
				break;
			case 11:
				if(c=="("){nivel.parenteses++;str+=c;i++;}
				else if(c=="["){nivel.colchetes++;str+=c;i++;}
				else if(c=="]"){nivel.colchetes--;str+=c;i++;}
				else if(c==")"&&nivel.parenteses>0){nivel.parenteses--;str+=c;i++;}
				else if(c==","&&nivel.parenteses==0&&nivel.colchetes==0){s=12;i++;}
				else if(c=='\''){s=16;str+=c;i++;nivel.estadoAnterior=11;}
				else if((c=="."&&nivel.parenteses==0&&nivel.colchetes==0)||i==termo.length-1){s=13;}
				else
				{
					if(c!="\n"&&c!="\r\n"&&c!=" "&&c!="\t")str+=c;
					i++;
				}
				break;
			case 12:
				estrutura.regras.push(Parse(str,true));
				str="";
				s=11;
				break;
			case 13:
				if(c!="."&&c!=" "&&c!="\r\n"&&c!="\n"&&c!="\t")str+=c;
				estrutura.regras.push(Parse(str,true));
				str="";
				termos.push(estrutura);
				s=0;
				i++;
				break;
			case 14:
				estrutura=new TermoComposto(str);
				str="";
				s=9;
				nivel.parenteses=0;
				break;
			case 15:
				if(c=='\'')s=nivel.estadoAnterior;
				else str+=c;
				if(i==termo.length-1)s=3;
				else i++;
				break;
			case 16:
				if(c=='\'')s=nivel.estadoAnterior;
				str+=c;
				i++;
				break;
			case 17:
				nivel.parenteses=0;
				nivel.colchetes=0;
				nivel.indexLista=0;
				nivel.operadorLista=-1;
				estrutura=new TermoComposto("'.'");
				estrutura.aridade=2;
				nivel.elemento=estrutura.parametros;
				s=18;
				break;
			case 18:
				if(c=="("){nivel.parenteses++;str+=c;i++;}
				if(c=="["){nivel.colchetes++;str+=c;i++;}
				else if(c==")"){nivel.parenteses--;str+=c;i++;}
				else if(c=="]"&&nivel.colchetes>0){nivel.colchetes--;i++;str+=c;}
				else if(c=="]"&&nivel.colchetes==0){s=20;}
				else if(c==","&&nivel.colchetes==0){s=19;i++;}
				else if(c=="|"&&nivel.colchetes==0){s=21;i++;}
				else if(c=='\''){s=16;str+=c;i++;nivel.estadoAnterior=18;}
				else
				{
					if(c!="\n"&&c!="\r\n"&&c!=" "&&c!="\t")str+=c;
					i++;
				}
				break;
			case 19:
				nivel.elemento[0]=Parse(str,true);
				nivel.elemento[1]=new TermoComposto("'.'");
				nivel.elemento[1].aridade=2;
				nivel.elemento=nivel.elemento[1].parametros;
				nivel.indexLista++;
				str="";
				s=18;
				break;
			case 20:
				if(str==""&&estrutura.parametros.length==0)
				{
					estrutura=new TermoComposto("[]");
				}
				else
				{
					nivel.elemento[0]=Parse(str,true);
					nivel.elemento[1]=new TermoComposto("[]");
					str="";
				}
				estrutura.operadorLista=nivel.operadorLista;
				termos.push(estrutura);
				i++;
				s=1;
				break;
			case 21:
				nivel.elemento[0]=Parse(str,true);
				nivel.elemento[1]=new TermoComposto("'.'");
				nivel.elemento[1].aridade=2;
				nivel.elemento=nivel.elemento[1].parametros;
				str="";
				nivel.operadorLista=nivel.indexLista;
				s=18;
				break;
			case 24:
				if(c=="\"")s=nivel.estadoAnterior;
				str+=c;
				i++;
				break;
			case 25:
				estrutura=new TermoComposto("'.'");
				estrutura.aridade=2;
				nivel.elemento=estrutura;
				nivel.barraInvertida=false;
				if(c=="\"")s=27;
				else
				{
					s=26;
					nivel.elemento.parametros[0]=new TermoComposto(c.charCodeAt(0));
					i++;
				}
				if(c=="\\"){nivel.barraInvertida=true;i++;}
				break;
			case 26:
				if(c=="\""&&!nivel.barraInvertida)s=28;
				else if(c=="\\"&&!nivel.barraInvertida){nivel.barraInvertida=true;i++;}
				else
				{
					nivel.elemento.parametros[1]=new TermoComposto("'.'");
					nivel.elemento=nivel.elemento.parametros[1];
					nivel.elemento.aridade=2;
					nivel.elemento.parametros[0]=new TermoComposto(c.charCodeAt(0));
					i++;
				}
				break;
			case 27:
				estrutura=new TermoComposto("[]");
				termos.push(estrutura);
				i++;
				s=1;
				break;
			case 28:
				nivel.elemento.parametros[1]=new TermoComposto("[]");
				str="";
				termos.push(estrutura);
				i++;
				s=1;
				break;
		}
	}
	if(naoPadronizarInstancias==undefined) for(var i=0;i<termos.length;i++)
	{
		if(termos[i].tipo==TERMO_COMPOSTO)
		{
			var variaveis=new VariaveisEscopo(termos[i]);
			var trilha=[];
			for(var iv=0;iv<variaveis.length;iv++)
			{
				if(trilha.indexOf(variaveis.at(iv))==-1)
				{
					var v=variaveis.at(iv);
					trilha.push(v);
					variaveis.substituir(v,new Variavel(v.nome));
				}
			}
		}
	}
	if(termos.length>1)return termos;
	else return termos[0];
}
