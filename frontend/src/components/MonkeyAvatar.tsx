import React from 'react';

interface MonkeyAvatarProps {
  size?: number;
  className?: string;
  isProfitable?: boolean; // 是否盈利
  isLosing?: boolean; // 新增属性：是否亏损
}

const MonkeyAvatar: React.FC<MonkeyAvatarProps> = ({ size = 80, className = "", isProfitable = false, isLosing = false }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* 猴子头部 - 更圆润的猴子头型 */}
        <ellipse cx="50" cy="35" rx="22" ry="25" fill="#8B4513" stroke="#654321" strokeWidth="2"/>
        
        {/* 猴子耳朵 - 更大更突出 */}
        <ellipse cx="32" cy="25" rx="6" ry="10" fill="#8B4513" stroke="#654321" strokeWidth="1.5"/>
        <ellipse cx="68" cy="25" rx="6" ry="10" fill="#8B4513" stroke="#654321" strokeWidth="1.5"/>
        <ellipse cx="32" cy="25" rx="3" ry="6" fill="#CD853F"/>
        <ellipse cx="68" cy="25" rx="3" ry="6" fill="#CD853F"/>
        
        {/* 猴子脸部区域 - 典型的猴子脸型 */}
        <ellipse cx="50" cy="38" rx="16" ry="18" fill="#D2B48C"/>
        
        {/* 猴子嘴部突出区域 - 猴子特有的嘴部轮廓 */}
        <ellipse cx="50" cy="45" rx="12" ry="8" fill="#F4A460"/>
        
        {/* 猴子眼睛 - 更大更生动，根据盈亏调整表情 */}
        <ellipse cx="43" cy="32" rx="4" ry="3.5" fill="white"/>
        <ellipse cx="57" cy="32" rx="4" ry="3.5" fill="white"/>
        <circle cx="43" cy="32" r="2" fill="black"/>
        <circle cx="57" cy="32" r="2" fill="black"/>
        
        {/* 眼睛高光和表情 */}
        {isProfitable ? (
          // 开心时眼睛弯弯的
          <>
            <circle cx="43.8" cy="31.2" r="0.8" fill="white"/>
            <circle cx="57.8" cy="31.2" r="0.8" fill="white"/>
            <path d="M 39 30 Q 43 28 47 30" stroke="#654321" strokeWidth="1.5" fill="none"/>
            <path d="M 53 30 Q 57 28 61 30" stroke="#654321" strokeWidth="1.5" fill="none"/>
          </>
        ) : isLosing ? (
          // 亏钱时眼睛有泪水
          <>
            <circle cx="43.8" cy="31.2" r="0.8" fill="white"/>
            <circle cx="57.8" cy="31.2" r="0.8" fill="white"/>
            <ellipse cx="41" cy="36" rx="1" ry="3" fill="#87CEEB" opacity="0.8"/>
            <ellipse cx="59" cy="36" rx="1" ry="3" fill="#87CEEB" opacity="0.8"/>
            <path d="M 39 34 Q 43 36 47 34" stroke="#654321" strokeWidth="1.5" fill="none"/>
            <path d="M 53 34 Q 57 36 61 34" stroke="#654321" strokeWidth="1.5" fill="none"/>
          </>
        ) : (
          // 正常表情
          <>
            <circle cx="43.8" cy="31.2" r="0.8" fill="white"/>
            <circle cx="57.8" cy="31.2" r="0.8" fill="white"/>
          </>
        )}
        
        {/* 猴子鼻子 - 更立体的鼻子 */}
        <ellipse cx="50" cy="40" rx="3" ry="2" fill="#CD853F"/>
        <ellipse cx="48.5" cy="39.5" rx="0.8" ry="1.2" fill="#A0522D"/>
        <ellipse cx="51.5" cy="39.5" rx="0.8" ry="1.2" fill="#A0522D"/>
        
        {/* 猴子嘴巴 - 根据盈利状态调整表情，更明显的嘴巴 */}
        {isProfitable ? (
          // 开心大笑
          <>
            <path d="M 40 48 Q 50 56 60 48" stroke="#654321" strokeWidth="3" fill="none"/>
            <ellipse cx="50" cy="51" rx="8" ry="3" fill="#8B4513" opacity="0.4"/>
          </>
        ) : isLosing ? (
          // 难过哭脸
          <>
            <path d="M 40 52 Q 50 46 60 52" stroke="#654321" strokeWidth="3" fill="none"/>
            <ellipse cx="50" cy="49" rx="6" ry="2" fill="#8B4513" opacity="0.3"/>
          </>
        ) : (
          // 平静表情
          <>
            <path d="M 42 48 Q 50 52 58 48" stroke="#654321" strokeWidth="2.5" fill="none"/>
            <ellipse cx="50" cy="49" rx="6" ry="2" fill="#8B4513" opacity="0.3"/>
          </>
        )}
        
        {/* 猴子尾巴 - 新增 */}
        <path d="M 65 80 Q 75 70 80 60 Q 85 50 82 40 Q 80 35 85 30" 
              stroke="#8B4513" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M 65 80 Q 75 70 80 60 Q 85 50 82 40 Q 80 35 85 30" 
              stroke="#CD853F" strokeWidth="2" fill="none" strokeLinecap="round"/>
        
        {/* 猴子身体 - 调整位置避免与头部重合 */}
        <ellipse cx="50" cy="75" rx="15" ry="18" fill="#8B4513" stroke="#654321" strokeWidth="1.5"/>
        
        {/* 猴子胸部 */}
        <ellipse cx="50" cy="75" rx="10" ry="12" fill="#D2B48C"/>
        
        {/* 改进的猴子手臂连接 - 更自然的连接 */}
        <ellipse cx="35" cy="68" rx="4" ry="10" fill="#8B4513" stroke="#654321" strokeWidth="1"/>
        <ellipse cx="65" cy="68" rx="4" ry="10" fill="#8B4513" stroke="#654321" strokeWidth="1"/>
        
        {/* 手臂与身体的连接部分 */}
        <ellipse cx="40" cy="70" rx="6" ry="8" fill="#8B4513"/>
        <ellipse cx="60" cy="70" rx="6" ry="8" fill="#8B4513"/>
        
        {/* 改进的手部 - 更自然的手型 */}
        <ellipse cx="32" cy="78" rx="4" ry="3" fill="#D2B48C" stroke="#654321" strokeWidth="1"/>
        <ellipse cx="68" cy="78" rx="4" ry="3" fill="#D2B48C" stroke="#654321" strokeWidth="1"/>
        
        {/* 手指细节 */}
        <g opacity="0.6">
          <ellipse cx="30" cy="76" rx="1" ry="2" fill="#CD853F"/>
          <ellipse cx="34" cy="76" rx="1" ry="2" fill="#CD853F"/>
          <ellipse cx="66" cy="76" rx="1" ry="2" fill="#CD853F"/>
          <ellipse cx="70" cy="76" rx="1" ry="2" fill="#CD853F"/>
        </g>
        
        {/* 大量钱币 - 更大更多的钱币 */}
        <g transform="translate(68, 78)">
          {/* 主要钱币 - 更大 */}
          <circle cx="10" cy="-8" r="6" fill="#FFD700" stroke="#FFA500" strokeWidth="1.5"/>
          <text x="10" y="-5" textAnchor="middle" fontSize="4.5" fill="#FF6B00" fontWeight="bold">¥</text>
          
          {/* 第二层钱币 */}
          <circle cx="6" cy="-12" r="5" fill="#FFD700" stroke="#FFA500" strokeWidth="1.2"/>
          <text x="6" y="-9.5" textAnchor="middle" fontSize="3.8" fill="#FF6B00" fontWeight="bold">¥</text>
          
          <circle cx="14" cy="-14" r="4.5" fill="#FFD700" stroke="#FFA500" strokeWidth="1.2"/>
          <text x="14" y="-11.5" textAnchor="middle" fontSize="3.5" fill="#FF6B00" fontWeight="bold">¥</text>
          
          {/* 第三层钱币 */}
          <circle cx="2" cy="-6" r="4" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
          <text x="2" y="-4" textAnchor="middle" fontSize="3" fill="#FF6B00" fontWeight="bold">¥</text>
          
          <circle cx="16" cy="-4" r="3.5" fill="#FFD700" stroke="#FFA500" strokeWidth="1"/>
          <text x="16" y="-2.5" textAnchor="middle" fontSize="2.8" fill="#FF6B00" fontWeight="bold">¥</text>
        </g>
        
        {/* 猴子腿部 - 调整位置 */}
        <ellipse cx="42" cy="88" rx="4" ry="8" fill="#8B4513" stroke="#654321" strokeWidth="1"/>
        <ellipse cx="58" cy="88" rx="4" ry="8" fill="#8B4513" stroke="#654321" strokeWidth="1"/>
        
        {/* 猴子脚 */}
        <ellipse cx="42" cy="95" rx="4" ry="3" fill="#D2B48C" stroke="#654321" strokeWidth="1"/>
        <ellipse cx="58" cy="95" rx="4" ry="3" fill="#D2B48C" stroke="#654321" strokeWidth="1"/>
        
        {/* 金钱飞散效果 - 盈利时更多金钱特效，钱币更大 */}
        <g opacity={isProfitable ? "1" : "0.7"}>
          {/* 大钱币群组1 */}
          <circle cx="78" cy="20" r="3" fill="#FFD700">
            <animate attributeName="opacity" values="1;0.3;1" dur={isProfitable ? "1.5s" : "2s"} repeatCount="indefinite"/>
          </circle>
          <text x="78" y="22" textAnchor="middle" fontSize="2.5" fill="#FF6B00" fontWeight="bold">¥</text>
          
          <circle cx="88" cy="30" r="2.5" fill="#FFD700">
            <animate attributeName="opacity" values="0.3;1;0.3" dur={isProfitable ? "2s" : "2.5s"} repeatCount="indefinite"/>
          </circle>
          <text x="88" y="31.5" textAnchor="middle" fontSize="2" fill="#FF6B00" fontWeight="bold">¥</text>
          
          <circle cx="85" cy="45" r="2.2" fill="#FFD700">
            <animate attributeName="opacity" values="1;0.5;1" dur={isProfitable ? "1.2s" : "1.8s"} repeatCount="indefinite"/>
          </circle>
          <text x="85" y="46.2" textAnchor="middle" fontSize="1.8" fill="#FF6B00" fontWeight="bold">¥</text>
          
          {/* 大钱币群组2 */}
          <circle cx="15" cy="25" r="2.8" fill="#FFD700">
            <animate attributeName="opacity" values="0.4;1;0.4" dur={isProfitable ? "1.8s" : "2.3s"} repeatCount="indefinite"/>
          </circle>
          <text x="15" y="26.8" textAnchor="middle" fontSize="2.2" fill="#FF6B00" fontWeight="bold">¥</text>
          
          <circle cx="8" cy="40" r="2.5" fill="#FFD700">
            <animate attributeName="opacity" values="1;0.2;1" dur={isProfitable ? "1.4s" : "2.1s"} repeatCount="indefinite"/>
          </circle>
          <text x="8" y="41.5" textAnchor="middle" fontSize="2" fill="#FF6B00" fontWeight="bold">¥</text>
          
          {/* 盈利时额外的大金钱特效 */}
          {isProfitable && (
            <>
              <circle cx="75" cy="35" r="3.2" fill="#FFD700">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite"/>
                <animate attributeName="r" values="3.2;4;3.2" dur="2s" repeatCount="indefinite"/>
              </circle>
              <text x="75" y="37" textAnchor="middle" fontSize="2.8" fill="#FF6B00" fontWeight="bold">¥</text>
              
              <circle cx="92" cy="55" r="2.8" fill="#FFD700">
                <animate attributeName="opacity" values="1;0.4;1" dur="2.2s" repeatCount="indefinite"/>
                <animate attributeName="r" values="2.8;3.5;2.8" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <text x="92" y="56.8" textAnchor="middle" fontSize="2.3" fill="#FF6B00" fontWeight="bold">¥</text>
              
              <circle cx="12" cy="55" r="2.6" fill="#FFD700">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="1.6s" repeatCount="indefinite"/>
                <animate attributeName="r" values="2.6;3.3;2.6" dur="1.8s" repeatCount="indefinite"/>
              </circle>
              <text x="12" y="56.6" textAnchor="middle" fontSize="2.1" fill="#FF6B00" fontWeight="bold">¥</text>
              
              <circle cx="83" cy="15" r="2.4" fill="#FFD700">
                <animate attributeName="opacity" values="0.8;1;0.8" dur="1.3s" repeatCount="indefinite"/>
                <animate attributeName="r" values="2.4;3.1;2.4" dur="2.5s" repeatCount="indefinite"/>
              </circle>
              <text x="83" y="16.4" textAnchor="middle" fontSize="1.9" fill="#FF6B00" fontWeight="bold">¥</text>
            </>
          )}
        </g>
        
        {/* 开心的腮红 */}
        <ellipse cx="35" cy="42" rx="3" ry="2" fill="#FFB6C1" opacity="0.7"/>
        <ellipse cx="65" cy="42" rx="3" ry="2" fill="#FFB6C1" opacity="0.7"/>
        
        {/* 猴子特有的毛发纹理 */}
        <g opacity="0.3">
          <path d="M 30 18 Q 32 21 30 23" stroke="#654321" strokeWidth="0.8" fill="none"/>
          <path d="M 70 18 Q 68 21 70 23" stroke="#654321" strokeWidth="0.8" fill="none"/>
          <path d="M 25 35 Q 27 38 25 40" stroke="#654321" strokeWidth="0.8" fill="none"/>
          <path d="M 75 35 Q 73 38 75 40" stroke="#654321" strokeWidth="0.8" fill="none"/>
        </g>
      </svg>
    </div>
  );
};

export default MonkeyAvatar;
