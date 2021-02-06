function adicionarLinha(nr) {
    return `
        <tr id="linha${nr}">
            <th class="nome"></th>
            <th class="tamanho"></th>
            <th class="preview"></th>
            <th>
                <button class="adicionar" type="button" onclick="adicionarFicheiro(${nr})"> &#10133; </button>
                <input name="novoFicheiro" type="file" id="novoFicheiro${nr}" style="display: none">
                <button class="remover" type="button" style="color: red; display: none" onclick="removerFicheiro('linha${nr}')"> &#10006; </button>
            </th>
        </tr>`
}

function editarRecurso(recurso) {
    $('#editar_recurso').empty()
    var r = JSON.parse(recurso)
    var tipos = JSON.parse($('#tipos_edicao').val())
  
    var html = `
    <form class="my-modal-content" style="width: 60%" action="/recursos/editar/${r._id}" method="POST" enctype="multipart/form-data">
      <div id="preview_recurso" class="modal" style="z-index: 101; width: 50%; max-width: 50; %height: 60%; max-height: 60%"></div>

      <h2 style="margin: 10px 20px 20px 20px">Editar recurso</h2>
      <div class="login_container">
        <input type="text" name="idAutor" value="${r.idAutor}" hidden>

        <div class="login_container">
            <div class="w3-col s3">
                <label class="w3-text-teal"><b>Nome: </b></label>
            </div>
            <div class="w3-col s9 w3-border">
                <input class="w3-input w3-border w3-light-grey" type="text" name="titulo" value="${r.titulo}" required>
            </div>
        </div>

        <div class="login_container">
            <div class="w3-col s3">
                <label class="w3-text-teal"><b>Descrição: </b></label>
            </div>
            <div class="w3-col s9 w3-border">
                <textarea class="w3-input w3-border w3-light-grey" type="text" name="descricao" required>${r.descricao}</textarea>
            </div>
        </div>

        <div class="login_container">
            <div class="w3-col s3">
                <label class="w3-text-teal"><b>Tipo: </b></label>
            </div>
            <div class="w3-col s9 w3-border">
                <select id="tipo_recurso" onchange="showNewTypeInput()" class="w3-input w3-border w3-light-grey" name="tipo" required>`
    
    tipos.forEach(t => {
        html += `<option value="${t}"`
        if (t == r.tipo) html += ' selected'
        html += `> ${t} </option>`
    })

    html += `       <option value="Outro"> Outro </option>
                </select>
            </div>
        </div>

        <div id="outro_tipo_recurso" class="login_container" style="display: none">
            <div class="w3-col s3">
                <label class="w3-text-teal"><b>Outro: </b></label>
            </div>
            <div class="w3-col s9 w3-border">
                <input class="w3-input w3-border w3-light-grey" type="text" name="outro_tipo">
            </div>
        </div>

        <script>
            function showNewTypeInput() {
                var value = document.getElementById("tipo_recurso").value
                var input = document.getElementById("outro_tipo_recurso")

                if (value == "Outro") input.style.display = "block";
                else input.style.display = "none";
            }
        </script>

        <div class="login_container">
            <div class="w3-col s3">
                <label class="w3-text-teal"><b>Visibilidade: </b></label>
            </div>
            <div class="w3-col s9">
                <label id="switch" class="switch">
                    <input type="checkbox" name="visibilidade" id="slider"`
    
    if (!r.visibilidade) html += ' checked'

    html += `>
                    <span class="slider round"></span>
                </label>
            </div>
        </div>

        <div class="login_container">
            <div class="w3-col s3">
                <label class="w3-text-teal"><b>Ficheiros: </b></label>
            </div>
            <div class="w3-col s9 w3-border">
                <table id="ficheiros" class="w3-table-all">
                    <tr>
                        <th> Nome </th>
                        <th> Tamanho </th>
                        <th> Visualizar </th>
                        <th></th>
                    </tr>`
                    
    r.ficheiros.forEach(f => {
        html += `<tr id="${f._id}">
                    <td> ${f.nome_ficheiro} </td>
                    <td> ${f.tamanho} </td>
                    <td><button type="button" class="resource-btn" onclick='mostrarPreviewAntigo("${f.nome_ficheiro}", "${f.tipo_mime}", "${f.diretoria}")')> 👁 </button></td>
                    <td><button type="button" style="color: red" onclick="removerFicheiro('${f._id}')"> &#10006; </button></td>
                </tr>`
    })

    html += adicionarLinha(1)
    html += `
                </table>
            </div>
        </div>

        <input id="nrFicheirosNovos" value="1" hidden>
  
        <div class="w3-row login_container w3-margin-bottom">
            <input class="w3-btn w3-blue-grey w3-margin-top" style="float:right" type="submit" value="Submeter"/>
            <input class="w3-btn w3-blue-grey w3-margin-top" onclick="cancelarEdicao()" style="float:right; margin-right: 10px" type="button" value="Cancelar"/>
        </div>
        </div>
    </form>`
  
    $('#editar_recurso').append(html)
    document.getElementById('editar_recurso').style.display = 'block'; 
}

function adicionarFicheiro(nr) {
    $('#novoFicheiro'+nr).click();
    $('#novoFicheiro'+nr).change(function () {
        if (this.files) {
            var nrFicheiroNovo = parseInt($('#nrFicheirosNovos').val())
            var detalhes = this.files[0]

            $(`#linha${nrFicheiroNovo} .nome`).html(detalhes.name)
            $(`#linha${nrFicheiroNovo} .tamanho`).html(calcularTamanho(detalhes.size))

            var preview = '<button type="button" class="resource-btn" onclick="mostrarPreviewNovo('+nr+')"> 👁 </button>'
            $(`#linha${nrFicheiroNovo} .preview`).html(preview)

            $(`#linha${nrFicheiroNovo} button.adicionar`).css("display","none")
            $(`#linha${nrFicheiroNovo} button.remover`).css("display","inline-block")

            $('#ficheiros tr:last').after(adicionarLinha(nrFicheiroNovo+1))
            $('#nrFicheirosNovos').val(nrFicheiroNovo+1)
        }
    })
}

function checkMimetype(type) {
    return Array.prototype.reduce.call(navigator.plugins, function (supported, plugin) {
        return supported || Array.prototype.reduce.call(plugin, function (supported, mime) {
            return supported || mime.type == type;
        }, supported);
    }, false);
}

function mostrarPreviewAntigo(nome, tipo, diretoria) {
    var html;

    if (tipo == 'image/png' || tipo == 'image/jpeg' || tipo == 'image/gif')
        html = `<span class="helper"></span><img id="previewNovoFicheiro" src="${diretoria}" style="max-width:100%; max-height:100%; border: 10px solid #000"/>`;
    else if (checkMimetype(tipo))
        html = `<iframe id="previewNovoFicheiro" src="${diretoria}" style="width:100%; height:100%"/>`;
    else 
        html = '<p>' + nome + ', ' + tipo + '<p>';
        
    $('#preview_recurso').empty();
    $('#preview_recurso').append(html);
    $('#preview_recurso').modal();
}

function mostrarPreviewNovo(nr) {
    var ficheiro = $('#novoFicheiro'+nr)[0].files[0]
    var html;

    if (ficheiro.type == 'image/png' || ficheiro.type == 'image/jpeg' || ficheiro.type == 'image/gif')
        html = `<span class="helper"></span><img id="previewNovoFicheiro" src="" style="max-width:100%; max-height:100%; border: 10px solid #000"/>`;
    else if (checkMimetype(ficheiro.type))
        html = `<iframe id="previewNovoFicheiro" src="" style="width:100%; height:100%"/>`;
    else 
        html = '<p>' + ficheiro.name + ', ' + ficheiro.type + '<p>';
        
    $('#preview_recurso').empty();
    $('#preview_recurso').append(html);

    var reader = new FileReader();
    reader.onload = function(e) { $('#previewNovoFicheiro').attr('src', e.target.result); }

    reader.readAsDataURL(ficheiro); // convert to base64 string
    $('#previewNovoFicheiro').css("display","inline-block")

    $('#preview_recurso').modal();
}

function removerFicheiro(id) {
    var nrLinhas = $('#ficheiros tr').length - 2 //th's e linha de adicionar recursos
    if (nrLinhas == 1) window.alert('O recurso precisa de ter pelo menos 1 ficheiro!') 
    else $('#'+id).remove();
}

function cancelarEdicao() {
    document.getElementById('editar_recurso').style.display = 'none';
}

function calcularTamanho(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    else {
      var kb = bytes/1024;
      if (kb < 1024) return `${(kb.toFixed(2))} KB`;
      else {
        var mb = kb/1024;
        if (mb < 1024) return `${(mb.toFixed(2))} MB`;
  
        return `${(mb/1024).toFixed(2)} GB`;
      }
    }
  }