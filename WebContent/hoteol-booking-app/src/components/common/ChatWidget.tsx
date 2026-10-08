import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Bot, User, RefreshCw } from 'lucide-react'; // 💡 RefreshCw(새로고침 아이콘) 추가

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);

    // 초기 환영 메시지를 상수로 분리
    const initialMessage: ChatMessage = {
        sender: 'ai',
        text: '안녕하세요! AI 야호 입니다. 제주도 여행에 대해 무엇이든 물어보세요! 🌴'
    };

    const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const quickReplies = [
        "🌴 2박 3일 제주 커플 여행 코스 추천해줘",
        "💳 예약 취소 및 환불 규정이 어떻게 돼?",
        "🍊 제주도 흑돼지 맛집 알려줘"
    ];

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    // 💡 새 채팅(초기화) 기능 추가
    const handleResetChat = () => {
        if (window.confirm('대화 내용을 지우고 새로운 채팅을 시작하시겠습니까?')) {
            setMessages([initialMessage]);
            setInputValue('');
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userText = inputValue.trim();
        setInputValue('');
        setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
        setIsLoading(true);

        try {
            const res = await axios.post('/api/v1/chat', { message: userText });
            const aiText = res.data.response;
            setMessages((prev) => [...prev, { sender: 'ai', text: aiText }]);
        } catch (error) {
            setMessages((prev) => [...prev, { sender: 'ai', text: '죄송합니다. 현재 네트워크 오류로 답변을 드릴 수 없습니다.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999 }}>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: '#123f4d',
                        color: '#ffffff',
                        border: 'none',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    <MessageCircle size={28} />
                </button>
            )}

            {isOpen && (
                <div style={{
                    width: '350px',
                    height: '520px',
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0'
                }}>
                    {/* 상단 헤더 */}
                    <div style={{
                        padding: '16px 20px',
                        backgroundColor: '#123f4d',
                        color: '#ffffff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Bot size={22} color="#6ee7b7" />
                            <strong style={{ fontSize: '15px' }}>제주 야호 AI 가이드</strong>
                        </div>

                        {/* 💡 초기화 버튼 & 닫기 버튼 배치 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <button
                                onClick={handleResetChat}
                                title="새로운 채팅 시작"
                                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 0, display: 'flex' }}
                            >
                                <RefreshCw size={17} />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                title="창 닫기"
                                style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', padding: 0, display: 'flex' }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* 대화 영역 */}
                    <div style={{
                        flex: 1,
                        padding: '20px',
                        overflowY: 'auto',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'flex-start',
                                flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                            }}>
                                <div style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    backgroundColor: msg.sender === 'user' ? '#e2e8f0' : '#ccfbf1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {msg.sender === 'user' ? <User size={16} color="#64748b" /> : <Bot size={16} color="#0f766e" />}
                                </div>
                                <div style={{
                                    maxWidth: '75%',
                                    padding: '10px 14px',
                                    borderRadius: '14px',
                                    backgroundColor: msg.sender === 'user' ? '#123f4d' : '#ffffff',
                                    color: msg.sender === 'user' ? '#ffffff' : '#1e293b',
                                    border: msg.sender === 'user' ? 'none' : '1px solid #e2e8f0',
                                    fontSize: '13px',
                                    lineHeight: 1.5,
                                    borderTopLeftRadius: msg.sender === 'ai' ? '2px' : '14px',
                                    borderTopRightRadius: msg.sender === 'user' ? '2px' : '14px',
                                    whiteSpace: 'pre-line'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#ccfbf1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Bot size={16} color="#0f766e" />
                                </div>
                                <div style={{ padding: '10px 14px', borderRadius: '14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', fontSize: '13px', color: '#94a3b8' }}>
                                    입력중...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* 빠른 질문(Quick Reply) 칩 영역 */}
                    {messages.length < 3 && (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            padding: '0 16px 12px 16px',
                            backgroundColor: '#f8fafc'
                        }}>
                            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>이렇게 물어보세요!</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {quickReplies.map((reply, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setInputValue(reply)}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #cbd5e1',
                                            borderRadius: '16px',
                                            fontSize: '12px',
                                            color: '#123f4d',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                                        }}
                                    >
                                        {reply}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 입력 영역 */}
                    <form onSubmit={handleSendMessage} style={{
                        padding: '12px',
                        borderTop: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        gap: '8px'
                    }}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="제주도 숙소에 대해 물어보세요..."
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                padding: '10px 14px',
                                borderRadius: '20px',
                                border: '1px solid #cbd5e1',
                                fontSize: '13px',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: inputValue.trim() && !isLoading ? '#123f4d' : '#e2e8f0',
                                color: '#ffffff',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed'
                            }}
                        >
                            <Send size={16} style={{ marginLeft: '2px' }} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}