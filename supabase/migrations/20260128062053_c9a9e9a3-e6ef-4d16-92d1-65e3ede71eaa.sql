CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '[]',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);


ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quizzes" ON public.quizzes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quizzes" ON public.quizzes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quizzes" ON public.quizzes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view questions for their quizzes" ON public.quiz_questions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = quiz_questions.quiz_id AND quizzes.user_id = auth.uid()));
CREATE POLICY "Users can insert questions for their quizzes" ON public.quiz_questions FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = quiz_questions.quiz_id AND quizzes.user_id = auth.uid()));
CREATE POLICY "Users can delete questions for their quizzes" ON public.quiz_questions FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.quizzes WHERE quizzes.id = quiz_questions.quiz_id AND quizzes.user_id = auth.uid()));

CREATE POLICY "Users can view their own attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own attempts" ON public.quiz_attempts FOR DELETE USING (auth.uid() = user_id);