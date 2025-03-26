
export interface GrammarPattern {
  id: string;
  level: string;
  pattern: string;
  meaning: string;
  example: string;
  structure: string;
  notes: string;
  jlpt_level: string;
}

export const getPatternsByLevel = async (level: string): Promise<GrammarPattern[]> => {
  try {
    const data = [
      {
        "id": "1",
        "level": "N5",
        "pattern": "〜は〜です",
        "meaning": "〜 is 〜",
        "example": "これは本です (kore wa hon desu) - This is a book.",
        "structure": "Noun は Noun です",
        "notes": "Used to define what something is.",
        "jlpt_level": "N5"
      },
      {
        "id": "2",
        "level": "N5",
        "pattern": "〜は〜ではありません",
        "meaning": "〜 is not 〜",
        "example": "これは車ではありません (kore wa kuruma dewa arimasen) - This is not a car.",
        "structure": "Noun は Noun ではありません",
        "notes": "Negative form of 'desu'.",
        "jlpt_level": "N5"
      },
      {
        "id": "3",
        "level": "N5",
        "pattern": "〜も",
        "meaning": "〜 also",
        "example": "私も学生です (watashi mo gakusei desu) - I am also a student.",
        "structure": "Noun も",
        "notes": "Indicates 'also' or 'too'.",
        "jlpt_level": "N5"
      },
      {
        "id": "4",
        "level": "N5",
        "pattern": "〜の",
        "meaning": "〜's",
        "example": "私の本 (watashi no hon) - My book.",
        "structure": "Noun の Noun",
        "notes": "Indicates possession or attribute.",
        "jlpt_level": "N5"
      },
      {
        "id": "5",
        "level": "N5",
        "pattern": "〜から",
        "meaning": "From ~",
        "example": "日本から来ました (nihon kara kimashita) - I came from Japan.",
        "structure": "Place から",
        "notes": "Indicates origin or starting point.",
        "jlpt_level": "N5"
      },
      {
        "id": "6",
        "level": "N4",
        "pattern": "〜が欲しい (〜がほしい)",
        "meaning": "Want ~",
        "example": "新しい車が欲しい (atarashii kuruma ga hoshii) - I want a new car.",
        "structure": "Noun が 欲しい",
        "notes": "Expresses desire for something.",
        "jlpt_level": "N4"
      },
      {
        "id": "7",
        "level": "N4",
        "pattern": "〜が好き (〜がすき)",
        "meaning": "Like ~",
        "example": "犬が好きです (inu ga suki desu) - I like dogs.",
        "structure": "Noun が 好きです",
        "notes": "Expresses liking something.",
        "jlpt_level": "N4"
      },
      {
        "id": "8",
        "level": "N4",
        "pattern": "〜が嫌い (〜がきらい)",
        "meaning": "Dislike ~",
        "example": "虫が嫌いです (mushi ga kirai desu) - I dislike insects.",
        "structure": "Noun が 嫌いです",
        "notes": "Expresses disliking something.",
        "jlpt_level": "N4"
      },
      {
        "id": "9",
        "level": "N4",
        "pattern": "〜ましょう",
        "meaning": "Let's ~",
        "example": "一緒に勉強しましょう (issho ni benkyou shimashou) - Let's study together.",
        "structure": "Verb (stem) ましょう",
        "notes": "Suggests doing something together.",
        "jlpt_level": "N4"
      },
      {
        "id": "10",
        "level": "N4",
        "pattern": "〜てもいいですか",
        "meaning": "May I ~?",
        "example": "ここで食べてもいいですか (koko de tabete mo ii desu ka) - May I eat here?",
        "structure": "Verb (te-form) もいいですか",
        "notes": "Asks for permission to do something.",
        "jlpt_level": "N4"
      },
      {
        "id": "11",
        "level": "N3",
        "pattern": "〜と思います (〜とおもいます)",
        "meaning": "I think ~",
        "example": "明日は雨が降ると思います (ashita wa ame ga furu to omoimasu) - I think it will rain tomorrow.",
        "structure": "Sentence と思います",
        "notes": "Expresses one's thoughts or opinions.",
        "jlpt_level": "N3"
      },
      {
        "id": "12",
        "level": "N3",
        "pattern": "〜かもしれません",
        "meaning": "Maybe ~",
        "example": "彼は来ないかもしれません (kare wa konai kamoshiremasen) - Maybe he won't come.",
        "structure": "Sentence かもしれません",
        "notes": "Expresses uncertainty or possibility.",
        "jlpt_level": "N3"
      },
      {
        "id": "13",
        "level": "N3",
        "pattern": "〜でしょう",
        "meaning": "Probably ~",
        "example": "明日は晴れるでしょう (ashita wa hareru deshou) - It will probably be sunny tomorrow.",
        "structure": "Sentence でしょう",
        "notes": "Expresses a high degree of certainty.",
        "jlpt_level": "N3"
      },
      {
        "id": "14",
        "level": "N3",
        "pattern": "〜ために",
        "meaning": "In order to ~",
        "example": "日本語を勉強するために日本へ来ました (nihongo o benkyou suru tame ni nihon e kimashita) - I came to Japan in order to study Japanese.",
        "structure": "Verb (dictionary form) ために",
        "notes": "Expresses purpose or intention.",
        "jlpt_level": "N3"
      },
      {
        "id": "15",
        "level": "N3",
        "pattern": "〜やすい",
        "meaning": "Easy to ~",
        "example": "この本は読みやすい (kono hon wa yomiyasui) - This book is easy to read.",
        "structure": "Verb (stem) やすい",
        "notes": "Indicates something is easy to do.",
        "jlpt_level": "N3"
      }
    ];
    
    return data as GrammarPattern[];
  } catch (error) {
    console.error('Error getting grammar patterns:', error);
    return [];
  }
};
