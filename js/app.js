const COUNT_DOWN = 15000//15s
const THRESHHOLD = 2

// const GENRES = ["影视"]
//HELPER FUNC:
function formatCountDown(timeLeft){
  const sec = Math.floor(timeLeft / 1000)
  return sec
}
function randomSelectIdx(range){
  return Math.floor(Math.random()*range)
}
function selectUnrepeat(questions,seen){
  while (true) {
    const range = questions.length
    const idx = randomSelectIdx(range)
    if (seen.indexOf(questions[idx]) === -1){
      return questions[idx]
    }
  }
}

const State =   {
  genre: null,
  questions:[],
  seen:[],
  timer: [],
  timeLeft:COUNT_DOWN,
  score:0,

  selectGenre: (genre) => {
    if (State.genre != null){
      ViewController.unlockCard(State.genre)
    }
    State.genre = genre
    ViewController.lockCard(State.genre)
  },
  getQuestions: () => {

    State.score = 0
    State.questions = questionsSet[State.genre].questions
    const answered = questionsSet[State.genre].answered
    console.log(answered)
    if (State.questions.length - answered <= THRESHHOLD){
      alert("题太少了，换一个吧")
      return
    }
    const question = selectUnrepeat(State.questions,State.seen)
    State.seen.push(question)
    questionsSet[State.genre].answered ++
    ViewController.unlockCard(State.genre)
    ViewController.disableBtn()
    ViewController.showGame(State.genre,question,State.timeUp)
    ViewController.showBackButton()

    let timeLeft = COUNT_DOWN
    State.timer = setInterval(()=>{
      console.log("interval still running!")
      timeLeft = timeLeft - 1000
      if (timeLeft === 0){
        //TODO:TIME'S UP
        //CHANGE TO SCOREBOARD
        State.timeUp(State.timer)
      }
      ViewController.changeCounter(timeLeft)
    },1000)
  },
  skipQuestion: () => {
    const answered = questionsSet[State.genre].answered
    if (State.questions.length - answered === 0){
      //TODO: NO MORE QUESTIONS
      alert("todo:没有题了")
      return
    }
    const question = selectUnrepeat(State.questions,State.seen)
    State.seen.push(question)
    questionsSet[State.genre].answered ++
    ViewController.newQuestion(question)
  },
  answerQuestion: ()=>{
    State.score ++
    console.log(State.score)
    ViewController.changeCurrScore(State.score)
    State.skipQuestion()
  },
  timeUp: (timer) => {
    console.log("state.timeup")
    clearInterval(timer)
    ViewController.showScore(State.score)
    State.score = 0
  },
  toMain: () => {
    State.genre = null
    State.questions = []
    State.timeLeft = COUNT_DOWN
    ViewController.showMain()
  },
  giveup: () => {
    clearInterval(State.timer)
    ViewController.showMain()

  },
  reset: () => {
    alert("成功重置答题记录！之前答过的题目会再次出现哦")
    State.seen = []
    for (let key in questionsSet){
      questionsSet[key].answered = 0
    }
  }
}

class ViewController{
  static unlockCard(genre){
    const card = document.getElementById(genre)
    card.classList.remove("selected")
  }
  static lockCard(genre){
    const card = document.getElementById(genre)
    card.classList.add("selected")
    const btn = document.getElementById("start-btn")
    btn.disabled = false
  }
  static disableBtn(){
    const btn = document.getElementById("start-btn")
    btn.disabled = true
  }

  static showGame(genre,question,cb){
    console.log("show game")
    //hide main view
    const main = document.getElementById("main")
    main.setAttribute("class","hide")
    //show game view
    const e = document.getElementById("game")
    e.setAttribute("class","column-center")
    //insert question
    const text = document.getElementsByClassName("text")[0]
    text.innerHTML = question
    ViewController.showBackButton()
    const reset = document.getElementById("reset")
    reset.disabled = true
    
  }
  static changeCounter(timeLeft){
    const countDown = document.getElementById("count-down")
    const sec = formatCountDown(timeLeft)
    if (sec < 10){
      countDown.classList.add("red")
    }else{
      countDown.classList.remove("red")
    }
    countDown.innerHTML = sec
  }
  static newQuestion(question){
    console.log("new question")
    const text = document.getElementsByClassName("text")[0]
    text.innerHTML = question
  }
  static changeCurrScore(score){
    const e = document.getElementById("curr-score")
    e.innerHTML = `已答对${score}题`
  }
  static showScore(score){
    //hide game
    const e = document.getElementById("game")
    e.setAttribute("class","hide")
    const pp = document.getElementById('score-popup')
    pp.setAttribute("class",'column-center')
    const s = document.getElementById("score")
    s.innerHTML = score
    ViewController.hideBackButton()


  }
  static showMain(){
    console.log("show main")
    //hide game
    const e = document.getElementById("game")
    e.setAttribute("class","hide")
    //hide score
    const pp = document.getElementById('score-popup')
    pp.setAttribute("class",'hide')
    //show main
    const main = document.getElementById("main")
    main.setAttribute("class","column-center")
    ViewController.hideBackButton()
    const reset = document.getElementById("reset")
    reset.disabled = false

  }
  static showBackButton(){
    const b = document.getElementById("back")
    b.disabled = false
  }
  static hideBackButton(){
    const b = document.getElementById("back")
    b.disabled = true
  }
}


class EventListener{
  static start(){
    //bind genre card to clicking event
    const a = document.getElementsByClassName("choice-list")[0]
    console.log("bind genre card to clicking event")
    a.addEventListener("click", (e) => {
      EventHandler.cardClicked(e)
    })
  }
}
class EventHandler{
  static cardClicked(e){
    if (e.target.nodeName === "LI"){
      const genre = e.target.id
      console.log(genre)
      State.selectGenre(genre)
    }
  }
  static startGame(){
    console.log("start game")
    setTimeout(State.getQuestions,300)
  }
  static handleSkip(){
    console.log("handle skip")
    State.skipQuestion()
  }
  static handleCorrect(){
    console.log("handle correct")
    State.answerQuestion()
  }
  static backToMain(){
    console.log('backToMain')
    State.toMain()
  }
  static backClicked(){
    State.giveup()
  }
  static resetClicked(){
    State.reset()
  }
}
function main(){
  console.log("welcome to pictionary")
  EventListener.start()
}
main()