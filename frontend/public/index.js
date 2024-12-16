const HOST = "localhost";
const PORT = 3000;

function statusCodehandler(response) {
  if (response.status >= 400 && response.status < 500) {
    throw new Error(`4XX Error`);
  }
  if (response.status >= 500) {
    throw new Error(`5XX Error`);
  }
  return response.json();
}

const noteService = {
  // 모든 노트들 가져오기
  getNotes: async function () {
    const data = await fetch(`http://${HOST}:${PORT}/api/notes`, {
      mode: "cors",
    }).then(statusCodehandler);
    return data;
  },
  // 새로운 노트 생성
  // note : {title, body, pinned, backgroundColor}
  createdNote: async function (note) {
    const data = await fetch(`http://${HOST}:${PORT}/api/notes`, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    }).then(statusCodehandler);
    console.info(`노트 ${note.title}가 생성되었습니다.`);
    return data;
  },
  // 기존 노트 수정
  updatedNote: async function (noteId, note) {
    const data = await fetch(`http://${HOST}:${PORT}/api/notes/${noteId}`, {
      method: "PUT",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(note),
    }).then(statusCodehandler);
    console.info(`노트 ${noteId}가 수정되었습니다.`);
    return data;
  },
  // 기존 노트 삭제
  deleteNote: async function (noteId) {
    const data = await fetch(`http://${HOST}:${PORT}/api/notes/${noteId}`, {
      method: "DELETE",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(statusCodehandler);
    console.info(`노트 ${noteId}가 삭제되었습니다.`);
    return data;
  },
};

class AddNoteBar {
  constructor({ onClick }) {
    this.elements = {
      container: document.querySelector("#newNoteBar"),
    };
    this.elements.container.addEventListener("click", onClick);
  }
}

class EmptyNotePlaceholder {
  constructor() {
    this.elements = {
      container: document.querySelector("#emptyNotes"),
    };
  }
  show() {
    this.elements.container.className = "";
  }
  hide() {
    this.elements.container.className = "hide";
  }
}

class Modal {
  constructor() {
    this.elements = {
      modalLayout: document.querySelector("#modalLayout"),
      modalWrapper: document.querySelector("#modalWrapper"),
      modalContainer: document.querySelector(".modal-container"),
      modalTitleInput: document.querySelector(
        "#modalWrapper .note-title-input"
      ),
      modalBodyInput: document.querySelector("#modalWrapper .note-body-input"),
      modalFooterPinButton: document.querySelector(
        "#modalWrapper .note-footer button.pin"
      ),
      modalFooterPinIcon: document.querySelector(
        "#modalWrapper .note-footer button.pin span"
      ),
      modalFooterColorSelectButton: document.querySelector(
        "#modalWrapper .note-footer div.color-select"
      ),
      modalFooterColorSelectIcon: document.querySelector(
        "#modalWrapper .note-footer div.color-select span"
      ),
      modalFooterColorSelectInput: document.querySelector(
        "#modalWrapper .note-footer input.color-picker"
      ),
      modalFooterDeleteButton: document.querySelector(
        "#modalWrapper .note-footer button.delete"
      ),
      modalFooterDeleteIcon: document.querySelector(
        "#modalWrapper .note-footer button.delete span"
      ),
      modalFooterCloseButton: document.querySelector(
        "#modalWrapper .note-footer button.close"
      ),
    };
    const that = this;
    this.elements.modalLayout.addEventListener("click", function () {
      that.close();
    });

    this.elements.modalTitleInput.addEventListener("input", function (event) {
      that.setTitle(event.target.value);
    });
    this.elements.modalBodyInput.addEventListener("input", function (event) {
      that.setBody(event.target.value);
    });
    this.elements.modalFooterPinButton.addEventListener("click", function () {
      that.setPin(!that.pinned);
    });
    this.elements.modalFooterColorSelectButton.addEventListener(
      "click",
      function (event) {
        event.stopPropagation();
        this.firstElementChild.click();
      }
    );
    this.elements.modalFooterColorSelectInput.addEventListener(
      "input",
      function () {
        const color = event.target.value;
        that.setBackgroundColor(color);
      }
    );
    this.elements.modalFooterDeleteButton.addEventListener(
      "click",
      async function () {
        await noteService.deleteNote(that.id);
        that.close();
      }
    );

    this.elements.modalFooterCloseButton.addEventListener("click", function () {
      that.deleted = true;
      that.close();
    });

    this.setNoteId();
    this.setTitle();
    this.setPin();
    this.setBackgroundColor();

    this.closeHandler = () => {};
  }

  open() {
    this.elements.modalWrapper.className = "";
    this.elements.modalLayout.className = "";
    this.elements.modalTitleInput.focus();

    if (this.id === null || this.id === undefined) {
      this.elements.modalFooterDeleteButton.style.display = "none";
    } else {
      this.elements.modalFooterDeleteButton.style.display = "block";
    }
  }
  close() {
    const obj = {
      id: this.id,
      title: this.title,
      body: this.body,
      pinned: this.pinned,
      backgroundColor: this.backrgoundColor,
      deleted : this.deleted,
    };
    this.elements.modalWrapper.className = "hide";
  this.elements.modalLayout.className = "hide";

    this.setNoteId();
    this.setTitle();
    this.setPin();
    this.setBackgroundColor();
    // this.deleted = false;

    this.closeHandler(obj);
  }

  onClose(fn) {
    this.closeHandler = fn;
  }
  setNoteId(id) {
    this.id = id !== undefined ? id : null;
  }
  setTitle(title) {
    this.title = title !== undefined ? title : "";
    this.elements.modalTitleInput.value = this.title;
  }
  setBody(body) {
    this.body = body !== undefined ? body : "";
    this.elements.modalBodyInput.innerHTML = this.body;
  }
  setPin(pinned) {
    this.pinned = pinned !== undefined ? pinned : false;
    if (this.pinned) {
      this.elements.modalFooterPinIcon.className = "matarial-icons md-18 gray";
    } else {
      this.elements.modalFooterPinIcon.className =
        "matarial-icons-outlined md-18 gray";
    }
  }
  setBackgroundColor(color) {
    this.backgroundColor = color !== undefined ? color : "#ffffff";
    this.elements.modalContainer.style.backgroundColor = this.backgroundColor;
  }
}

class Note {
  constructor({
    id,
    title,
    body,
    createdAt,
    updatedAt,
    pinned,
    backgroundColor,
    onClickNote,
    onClickPin,
    onChangeBackgoundColor,
    onClickDelete,
  }) {
    this.elements = this._createNoteElements(
      id,
      title,
      body,
      pinned,
      backgroundColor
    );

    const that = this;

    this.id = id;
    this.setTitle(title);
    this.setBody(body);
    this.setCreatedAt(createdAt);
    this.setUpdatedAt(updatedAt);
    this.setPin(pinned);
    this.setBackgroundColor(backgroundColor);

    this.elements.noteContainer.addEventListener("click", function (event) {
      onClickNote(event, that);
    });

    this.elements.pinButton.addEventListener("click", function (event) {
      event.stopPropagation();
      onClickPin(event, that);
    });

    this.elements.colorSelectButton.addEventListener(
      "change",
      function (event) {
        event.stopPropagation();
        const color = event.target.value;
        onChangeBackgoundColor(event, color, that);
      }
    );

    this.elements.deleteButton.addEventListener("click", function (event) {
      event.stopPropagation();
      onClickDelete(event, that);
    });
  }

  setTitle(title) {
    this.title = title !== undefined ? title : "";
    this.elements.noteTitle.textContent = this.title;
  }
  setBody(body) {
    // this.body = body !== undefined ? body : "";
    // const formattedBody = body.replace(/(?:\r\n|\r|\n)/g, "<br>");
    // this.elements.noteBody.innerHTML = formattedBody;
    this.body = body !== undefined && body !== null ? body : "";
    const formattedBody = this.body.replace(/(?:\r\n|\r|\n)/g, "<br>");
    this.elements.noteBody.innerHTML = formattedBody;
  }

  setCreatedAt(createdAt) {
    this.createdAt =
      createdAt !== undefined ? createdAt : Math.floor(Date.now() / 1000);
  }
  setUpdatedAt(updatedAt) {
    this.updatedAt =
      updatedAt !== undefined ? updatedAt : Math.floor(Date.now() / 1000);
  }
  setPin(pinned) {
    this.pinned = pinned !== undefined ? pinned : false;
    if (this.pinned) {
      this.elements.pinButtonIcon.className = "material-icon md-18 gray";
    } else {
      this.elements.pinButtonIcon.className =
        "material-icons-outlined md-18 gray";
    }
  }
  setBackgroundColor(color) {
    this.backgroundColor = color !== undefined ? color : "#ffffff";
    this.elements.noteContainer.style.backgroundColor = this.backgroundColor;
  }
  // 노트 컴포넌트 UI 생성
  _createNoteElements(id, title, body, pinned, backgroundColor) {
    const noteContainer = document.createElement("div");
    noteContainer.className = "note";
    noteContainer.id = id;
    noteContainer.style.backgroundColor = backgroundColor;

    const noteTitle = document.createElement("div");
    noteTitle.className = "note-title";
    if (title !== undefined && title !== null) {
      noteTitle.textContent = title;
    }

    const noteBody = document.createElement("div");
    noteTitle.className = "note-body";
    if (body !== undefined && body !== null) {
      noteBody.textContent = body.replace(/(?:\r\n|\r|\n)/g, "<br>");
    }

    const noteFooter = document.createElement("div");
    noteFooter.className = "note-footer flex-start";

    const pinButton = document.createElement("button");
    pinButton.className = "pin";

    const pinButtonIcon = document.createElement("span");
    pinButtonIcon.className = pinned ? "material-icons md-18 gray" : "material-icons-outlined md-18 gray";
    pinButtonIcon.textContent = "push_pin";

    const colorSelectButton = document.createElement("button");
    colorSelectButton.className = "color-select";
    colorSelectButton.addEventListener("click", function (event) {
      event.stopPropagation();
      this.firstElementChild.click();
    });

    const colorSelectInput = document.createElement("input");
    colorSelectInput.className = "color-picker";
    colorSelectInput.type = "color";

    const colorSelectButtonIcon = document.createElement("span");
    colorSelectButtonIcon.className = "material-icons-outlined md-18 gray";
    colorSelectButtonIcon.textContent = "palette";

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete";

    const deleteButtonIcon = document.createElement("span");
    deleteButtonIcon.className = "material-icons-outlined md-18 gray";
    deleteButtonIcon.textContent = "delete";

    deleteButton.append(deleteButtonIcon);
    colorSelectButton.append(colorSelectInput, colorSelectButtonIcon);
    pinButton.append(pinButtonIcon);

    noteFooter.append(pinButton, colorSelectButton, deleteButton);

    noteContainer.append(noteTitle, noteBody, noteFooter);

    return {
      noteContainer,
      noteTitle,
      noteBody,
      pinButton,
      pinButtonIcon,
      colorSelectButton,
      deleteButton,
    };
  }
}

class NoteList {
  constructor({ modal }) {
    this.elements = {
      pinnedNoteContainer: document.querySelector(
        "#pinnedNoteList .note-container"
      ),
      noteContainer: document.querySelector("#noteList .note-container"),
    };
    this.modalObj = modal;
    this.pinnedNoteList = [];
    this.noteList = [];
    this.listChangeHandler = () => {};
  }
  show() {
    this.elements.pinnedNoteContainer.parentElement.className = "note-section ";
    this.elements.noteContainer.parentElement.className = "note-section ";
  }
  hide() {
    this.elements.pinnedNoteContainer.parentElement.className =
      "note-section hide";
    this.elements.noteContainer.parentElement.className = "note-section hide";
  }

  getPinnedNoteList() {
    return this.pinnedNoteList;
  }

  getNoteList() {
    return this.noteList;
  }

  setAllNoteList(noteDataList) {
    const that = this;
    for (const noteData of noteDataList) {
      const noteObj = new Note({
        id: noteData.id,
        title: noteData.title,
        body: noteData.body,
        createdAt: noteData.createdAt,
        updatedAt: noteData.updatedAt,
        pinned: noteData.pinned,
        backgroundColor: noteData.backgroundColor,
        onClickNote: function (event, aNoteObj) {
          that.modalObj.setNoteId(aNoteObj.id);
          that.modalObj.setTitle(aNoteObj.title);
          that.modalObj.setBody(aNoteObj.body);
          that.modalObj.setPin(aNoteObj.pinned);
          that.modalObj.setBackgroundColor(aNoteObj.backgroundColor);
          that.modalObj.open();
        },
        onClickPin: async function (event, aNoteObj) {
          await noteService.updatedNote(aNoteObj.id, {
            pinned: !aNoteObj.pinned,
          });
          aNoteObj.setPin(!aNoteObj.pinned);
          that.removeNote(aNoteObj.id);
          that.addNote(aNoteObj);
          console.info(
            `note ${aNoteObj.id} had been ${
              aNoteObj.pinned ? "pinned" : "unpinned"
            }`
          );
        },
        onChangeBackgoundColor: async function (event, color, aNoteObj) {
          await noteService.updatedNote(aNoteObj.id, {
            backrgoundColor: color,
          });
          aNoteObj.setBackgroundColor(color);
          console.info(`color change into ${color}`);
        },
        onClickDelete: async function (event, aNoteObj) {
          await noteService.updatedNote(aNoteObj.id);
          that.removeNote(aNoteObj.id)
        },
      });
      this.addNote(noteObj);
    }
    this.listChangeHandler(this.pinnedNoteList, this.noteList);
  }

  addNote(noteObj) {
    if (noteObj.pinned) {
      this.pinnedNoteList.push(noteObj);
      this.elements.pinnedNoteContainer.prepend(noteObj.elements.noteContainer);
    } else {
      this.noteList.push(noteObj);
      this.elements.noteContainer.prepend(noteObj.elements.noteContainer);
    }
  }
  removeNote(id) {
    const note = this.noteList.find((note) => note.id === id);
    if (note !== undefined) {
      note.elements.noteContainer.remove();
      this.noteList = this.noteList.filter((note) => note.id !== id);
    } else {
      const pinnedNote = this.pinnedNoteList.find((note) => note.id === id);
      if (pinnedNote !== undefined) {
        pinnedNote.elements.noteContainer.remove();
        this.pinnedNoteList = this.noteList.filter((note) => note.id !== id);
      }
    }
  }

  onListChange(fn) {
    this.listChangeHandler = fn;
  }
}
async function init() {
  const noteDataList = await noteService.getNotes();

  const modalObj = new Modal();
  const addNoteBarObj = new AddNoteBar({
    onClick: function (evnet) {
      modalObj.open();
    },
  });

  const noteListObj = new NoteList({ modal: modalObj });

  const EmptyNotePlaceholderObj = new EmptyNotePlaceholder();

  // 노트가 추가되거나 삭제 될 때 마다 실행되는 콜백 함수
  noteListObj.onListChange((pinnedNoteList, noteList) => {
    if (pinnedNoteList.length === 0 && noteList.length === 0) {
      EmptyNotePlaceholderObj.show();
      noteListObj.hide();
    } else {
      EmptyNotePlaceholderObj.hide();
      noteListObj.show();
      
    }
  });

  noteListObj.setAllNoteList(noteDataList);
// 모달이 닫힐 때 마다 실행되는 콜백 함수 
  modalObj.onClose(async (note) => {
    console.log(note);
    if (note.deleted) {
      await noteService.deleteNote(note.id);
      noteListObj.removeNote(note.id);
      return;
    }

    const allNoteList = noteListObj.getPinnedNoteList().concat(noteListObj.getNoteList());

    if (note.id !== null && note.id !== undefined) {
      const currentNote = allNoteList.find((aNote) => aNote.id === note.id);
      if (currentNote !== undefined) {
        const updatedNote = await noteService.updatedNote(note.id, {
          title: note.title,
          body: note.body,
          pinned: note.pinned,
          backgroundColor: note.backgroundColor,
        });

        if (currentNote.pinned === note.pinned) {
          currentNote.setTitle(note.title);
          currentNote.setBody(note.body);
          currentNote.setPin(note.pinned);
          currentNote.setBackgroundColor(note.backgroundColor);
        } else {
          noteListObj.removeNote(note.id);
          noteListObj.addNote(
            new Note({
              id: updatedNote.id,
              title: updatedNote.title,
              body: updatedNote.body,
              pinned: updatedNote.pinned,
              backgroundColor: updatedNote.backgroundColor,
              // createdAt: updatedNote.createdAt,
              updatedAt: updatedNote.updatedAt,
            })
          )
        }
      }
    } else {
      const result = await noteService.createdNote({
        title: note.title,
        body: note.body,
        pinned: note.pinned,
        backgroundColor: note.backgroundColor,
      });

      const { id, createdAt, updatedAt } = result;

      const newNote = new Note({
        id,
        title: note.title,
        body: note.body,
        pinned: note.pinned,
        backgroundColor: note.backgroundColor,
        createdAt,
        updatedAt,
        onClickNote: function (event, NoteObj) {
          modalObj.setNoteId(noteObj.id);
          modalObj.setTitle(noteObj.title);
          modalObj.setBody(noteObj.body);
          modalObj.setPin(noteObj.pinned);
          modalObj.setBackgroundColor(noteObj.backgroundColor);
          modalObj.open();
        },
        onClickPin: async function (event, aNoteObj) {
          await noteService.updatedNote(aNoteObj.id, {
            pinned: !aNoteObj.pinned,
          });
          aNoteObj.setPin(!aNoteObj.pinned);
          noteListObj.removeNote(aNoteObj.id);
          noteListObj.addNote(aNoteObj);
          console.info(
            `note ${aNoteObj.id} had been ${aNoteObj.pinned ? "pinned" : "unpinned"
            }`
          );
        },
        onChangeBackgoundColor: async function (event, color, aNoteObj) {
          await noteService.updatedNote(aNoteObj.id, {
            backrgroundColor: color,
          });
          aNoteObj.setBackgroundColor(color);
          console.info(`color change into ${color}`);
        },
        onClickDelete: async function (event, aNoteObj) {
          await noteService.deleteNote(aNoteObj.id);
          noteListObj.removeNote(aNoteObj.id)
        },
      });

      noteListObj.addNote(newNote);
    }
  });
}

init();

/**
 *  Modal
 *  AddNoteBar => Modal
 *  EmptyNotePlaceholder
 *  Note => Modal
 *  NoteList =>  EmptyNotePlaceholder, Note
 */