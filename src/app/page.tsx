"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Operation = "add" | "sub" | "mul" | "div";
type Screen = "menu" | "settings" | "play" | "result";

const OPS: { key: Operation; label: string; labelPt: string; symbol: string; mob: string }[] = [
  { key: "add", label: "ADDITION", labelPt: "ADIÇÃO", symbol: "+", mob: "\u{1F416}" }, // pig
  { key: "sub", label: "SUBTRACTION", labelPt: "SUBTRAÇÃO", symbol: "-", mob: "\u{1F404}" }, // cow
  { key: "mul", label: "MULTIPLICATION", labelPt: "MULTIPLICAÇÃO", symbol: "×", mob: "\u{1F9DF}" }, // zombie-ish
  { key: "div", label: "DIVISION", labelPt: "DIVISÃO", symbol: "÷", mob: "\u{1F577}️" }, // spider
];

const DIFFICULTIES: { level: number; label: string; labelPt: string; mob: string }[] = [
  { level: 1, label: "EASY", labelPt: "FÁCIL", mob: "\u{1F411}" }, // sheep
  { level: 2, label: "MEDIUM", labelPt: "MÉDIO", mob: "\u{1F43A}" }, // wolf
  { level: 3, label: "HARD", labelPt: "DIFÍCIL", mob: "\u{1F479}" }, // creeper-ish ogre
];

const TEXT = {
  en: {
    intro: (n: number) =>
      `Mine blocks by solving math problems! Pick a topic and difficulty, then answer ${n} questions as fast as you can.`,
    startLesson: "START LESSON",
    chooseTopic: "CHOOSE TOPIC",
    chooseDifficulty: "CHOOSE DIFFICULTY",
    mine: "MINE!",
    back: "BACK",
    question: "QUESTION",
    blocksMined: "BLOCKS MINED",
    submit: "SUBMIT",
    correct: "CORRECT! +1 BLOCK MINED",
    wrong: "WRONG. ANSWER:",
    roundComplete: "ROUND COMPLETE!",
    accuracy: "ACCURACY",
    playAgain: "PLAY AGAIN",
    changeTopic: "CHANGE TOPIC",
  },
  pt: {
    intro: (n: number) =>
      `Minere blocos resolvendo problemas de matemática! Escolha um tema e uma dificuldade, depois responda ${n} perguntas o mais rápido que puder.`,
    startLesson: "COMEÇAR LIÇÃO",
    chooseTopic: "ESCOLHA O TEMA",
    chooseDifficulty: "ESCOLHA A DIFICULDADE",
    mine: "MINERAR!",
    back: "VOLTAR",
    question: "PERGUNTA",
    blocksMined: "BLOCOS MINERADOS",
    submit: "ENVIAR",
    correct: "CORRETO! +1 BLOCO MINERADO",
    wrong: "ERRADO. RESPOSTA:",
    roundComplete: "RODADA COMPLETA!",
    accuracy: "PRECISÃO",
    playAgain: "JOGAR DE NOVO",
    changeTopic: "MUDAR TEMA",
  },
};

const QUESTIONS_PER_ROUND = 10;

function randInt(max: number) {
  return Math.floor(Math.random() * max) + 1;
}

function makeQuestion(op: Operation, difficulty: number) {
  const range = 5 * difficulty; // 1 -> 5, 2 -> 10, 3 -> 15
  let a = randInt(range);
  let b = randInt(range);
  let answer: number;

  switch (op) {
    case "add":
      answer = a + b;
      break;
    case "sub":
      if (b > a) [a, b] = [b, a];
      answer = a - b;
      break;
    case "mul":
      a = randInt(Math.max(2, Math.floor(range / 2)));
      b = randInt(Math.max(2, Math.floor(range / 2)));
      answer = a * b;
      break;
    case "div":
      b = randInt(Math.max(2, Math.floor(range / 2)));
      answer = randInt(Math.max(2, Math.floor(range / 2)));
      a = b * answer;
      break;
  }

  const symbol = OPS.find((o) => o.key === op)!.symbol;
  return { text: `${a} ${symbol} ${b}`, answer };
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [operation, setOperation] = useState<Operation>("add");
  const [difficulty, setDifficulty] = useState(1);
  const [brazilMode, setBrazilMode] = useState(false);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [question, setQuestion] = useState(() => makeQuestion("add", 1));
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"none" | "correct" | "wrong">(
    "none"
  );
  const [correctCount, setCorrectCount] = useState(0);
  const [blocksMined, setBlocksMined] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the answer field focused for every question, no re-clicking needed.
  useEffect(() => {
    if (screen === "play" && feedback === "none") {
      inputRef.current?.focus();
    }
  }, [screen, feedback, questionIndex]);

  const accuracy = useMemo(() => {
    if (questionIndex === 0) return 0;
    return Math.round((correctCount / questionIndex) * 100);
  }, [correctCount, questionIndex]);

  function startRound() {
    setQuestionIndex(0);
    setCorrectCount(0);
    setBlocksMined(0);
    setInput("");
    setFeedback("none");
    setQuestion(makeQuestion(operation, difficulty));
    setScreen("play");
  }

  function submitAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (feedback !== "none" || input === "") return;

    const num = Number(input);
    const isCorrect = num === question.answer;

    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setBlocksMined((b) => b + 1);
    }

    setTimeout(() => {
      const nextIndex = questionIndex + 1;
      if (nextIndex >= QUESTIONS_PER_ROUND) {
        setQuestionIndex(nextIndex);
        setScreen("result");
      } else {
        setQuestionIndex(nextIndex);
        setQuestion(makeQuestion(operation, difficulty));
        setInput("");
        setFeedback("none");
      }
    }, 700);
  }

  const currentMob = OPS.find((o) => o.key === operation)?.mob ?? "\u{1F416}";
  const t = brazilMode ? TEXT.pt : TEXT.en;

  return (
    <div className="flex flex-col flex-1 min-h-screen app-sky">
      <button
        className="mc-btn pixel-border text-[9px] sm:text-[10px] px-3 py-2"
        style={{
          position: "fixed",
          top: 12,
          right: 12,
          zIndex: 10,
          width: "auto",
        }}
        onClick={() => setBrazilMode((b) => !b)}
      >
        {"\u{1F1E7}\u{1F1F7}"} BRAZIL MODE {brazilMode ? "ON" : "OFF"}
      </button>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
        <div className="grass-block" />

        <h1 className="mc-title text-2xl sm:text-4xl text-center leading-relaxed">
          MATH<span className="accent">CRAFT</span>
        </h1>

        {screen === "menu" && (
          <div className="mc-pop flex flex-col items-center gap-8">
            <p className="mc-panel text-black text-[11px] sm:text-xs leading-6 px-5 py-4 max-w-md text-center">
              {t.intro(QUESTIONS_PER_ROUND)}
            </p>
            <button
              className="mc-btn pixel-border"
              onClick={() => setScreen("settings")}
            >
              {"⚔️"} {t.startLesson}
            </button>
          </div>
        )}

        {screen === "settings" && (
          <div className="mc-pop mc-panel text-black w-full max-w-md px-5 py-6 flex flex-col gap-6">
            <div>
              <p className="text-[11px] mb-3">{t.chooseTopic}</p>
              <div className="grid grid-cols-2 gap-2">
                {OPS.map((o) => (
                  <button
                    key={o.key}
                    onClick={() => setOperation(o.key)}
                    className={`mob-btn ${
                      operation === o.key ? "selected" : ""
                    }`}
                  >
                    <span className="mob-icon">{o.mob}</span>
                    {brazilMode ? o.labelPt : o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] mb-3">{t.chooseDifficulty}</p>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.level}
                    onClick={() => setDifficulty(d.level)}
                    className={`mob-btn ${
                      difficulty === d.level ? "selected" : ""
                    }`}
                  >
                    <span className="mob-icon">{d.mob}</span>
                    {brazilMode ? d.labelPt : d.label}
                  </button>
                ))}
              </div>
            </div>

            <button className="mc-btn pixel-border" onClick={startRound}>
              {"⛏️"} {t.mine}
            </button>
            <button
              className="mc-btn pixel-border text-[10px]"
              onClick={() => setScreen("menu")}
            >
              {t.back}
            </button>
          </div>
        )}

        {screen === "play" && (
          <div
            key={questionIndex}
            className={`mc-pop mc-panel text-black w-full max-w-md px-5 py-6 flex flex-col items-center gap-5 ${
              feedback === "wrong" ? "mc-shake" : ""
            }`}
          >
            <p className="text-[10px] self-start">
              {t.question} {questionIndex + 1} / {QUESTIONS_PER_ROUND} &nbsp;|&nbsp;
              {t.blocksMined}: {blocksMined}
            </p>

            <span className="text-4xl mob-icon">{currentMob}</span>

            <p className="mc-title text-2xl text-black !text-shadow-none">
              {question.text} = ?
            </p>

            <form onSubmit={submitAnswer} className="flex flex-col gap-3 w-full">
              <input
                ref={inputRef}
                type="number"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={feedback !== "none"}
                className="pixel-border bg-white text-black text-center text-lg py-3 outline-none"
                placeholder="?"
              />
              <button
                type="submit"
                className="mc-btn pixel-border"
                disabled={feedback !== "none"}
              >
                {t.submit}
              </button>
            </form>

            {feedback === "correct" && (
              <p className="text-[#2e7d1a] text-xs">
                {"✅"} {t.correct}
              </p>
            )}
            {feedback === "wrong" && (
              <p className="text-[#a11d1d] text-xs">
                {"❌"} {t.wrong} {question.answer}
              </p>
            )}
          </div>
        )}

        {screen === "result" && (
          <div className="mc-pop mc-panel text-black w-full max-w-md px-5 py-6 flex flex-col items-center gap-4 text-center">
            <p className="text-[13px]">
              {accuracy >= 80 ? "\u{1F3C6} " : ""}{t.roundComplete}
            </p>
            <p className="text-[11px] leading-7">
              {t.blocksMined}: {blocksMined} / {QUESTIONS_PER_ROUND}
              <br />
              {t.accuracy}: {accuracy}%
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              {Array.from({ length: blocksMined }).map((_, i) => (
                <div
                  key={i}
                  className="grass-block"
                  style={{ width: 28, height: 28 }}
                />
              ))}
            </div>
            <button className="mc-btn pixel-border w-full" onClick={startRound}>
              {"\u{1F504}"} {t.playAgain}
            </button>
            <button
              className="mc-btn pixel-border w-full text-[10px]"
              onClick={() => setScreen("settings")}
            >
              {t.changeTopic}
            </button>
          </div>
        )}
      </main>

      <footer className="ground-strip">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="tile" />
        ))}
      </footer>
    </div>
  );
}
